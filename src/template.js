import React, { useState, useEffect } from 'react';
import { Typography, message, Alert, Row, Col } from 'antd';
import {
    ArrowLeftOutlined,
    SearchOutlined,
    StepBackwardFilled,
} from '@ant-design/icons';
import OrderListHeader from './components/OrderListHeader';
import OrderList from './components/OrderList';
import UpdateOrder from './components/UpdateOrder';
import Auth from './components/Auth';
import CancelOrder from './components/CancelOrder';
import SubmitOrder from './components/SubmitOrder';
import Stepper from './components/Stepper';
import { Actions } from './helpers';
import plugin from 'js-plugin';
import { cache } from '@ivoyant/component-cache';

import './styles.css';

const InitialView = (
    <div className="view-container d-flex justify-content-center align-items-center">
        <div className="content">
            <div className="element">
                <div className="icon-container">
                    <SearchOutlined
                        style={{ fontSize: '34px', color: 'white' }}
                    />
                </div>
            </div>
            <div className="element text-center">
                <Typography.Title level={3}>
                    Find orders by typing a search parameter <br /> or selecting
                    a date range
                </Typography.Title>
            </div>
        </div>
    </div>
);

const ActionFlow = ({
    order,
    action,
    workflows,
    datasources,
    fetchLastSearchOrder,
}) => {
    if (action === Actions.UPDATE) {
        return (
            <UpdateOrder
                order={order}
                workflows={workflows}
                datasources={datasources}
                fetchLastSearchOrder={fetchLastSearchOrder}
            />
        );
    }
    if (action === Actions.CANCEL) {
        return (
            <CancelOrder
                order={order}
                workflows={workflows}
                datasources={datasources}
            />
        );
    }
    if (action === Actions.SUBMIT) {
        return <SubmitOrder order={order} />;
    }
};

const flattenData = (arr) => {
    return arr.map((order) => {
        const { orderAccountInfo, ...rest } = order;
        return { ...rest, ...orderAccountInfo, key: rest.orderId };
    });
};

export default function OrderListWrapper({ datasources, properties }) {
    const { backButtonString = 'Search Order Res' } = properties;
    const [finalData, setFinalData] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [order, setOrder] = useState();
    const [action, setAction] = useState();
    const [needsAuth, setNeedsAuth] = useState(true);
    const [securityQuestionData, setSecurityQuestionData] = useState();
    const [error, setError] = useState();
    const [activateBackButton, setActivateBackButton] = useState(false);

    const collectSecurityQuestionResponse = (response) => {
        if (response && response.payload) {
            setSecurityQuestionData(response.payload);
        }
        window[window.sessionStorage?.tabId]['sendorders-auth-async-machine'](
            'RESET'
        );
    };

    useEffect(() => {
        window[window.sessionStorage?.tabId].authSecurityQuestionResponse = (
            value
        ) => collectSecurityQuestionResponse(value);

        return () => {
            delete window[window.sessionStorage?.tabId]
                .authSecurityQuestionResponse;
        };
    });

    const fetchDataWithParams = (params) => {
        setIsLoading(true);
        window[window.sessionStorage?.tabId]['sendsearch-order-async-machine'](
            'SET.REQUEST.DATA',
            {
                value: params,
            }
        );
        window[window.sessionStorage?.tabId]['sendsearch-order-async-machine'](
            'REFETCH'
        );
    };

    const collectSearchOrderResponse = (response) => {
        if (response && response.payload) {
            const { responseStatus, orders } = response.payload;
            if (responseStatus < 300) {
                setFinalData(flattenData(orders));
            } else {
                setFinalData([]);
                setError(
                    response?.payload?.causedBy?.length > 0
                        ? response?.payload?.causedBy[0]?.message
                        : 'Error searching the orders!'
                );
            }
        } else {
            setError('Internal Server Error!');
            setFinalData([]);
        }
        if (
            window[window.sessionStorage?.tabId][
                'sendsearch-order-async-machine'
            ]
        ) {
            window[window.sessionStorage?.tabId][
                'sendsearch-order-async-machine'
            ]('RESET');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        window[window.sessionStorage?.tabId].orderListSearchOrdersResponse = (
            value
        ) => collectSearchOrderResponse(value);

        return () => {
            delete window[window.sessionStorage?.tabId]
                .orderListSearchOrdersResponse;
        };
    });

    const handleActionClick = (actionType, record) => {
        setAction(actionType);
        setOrder({ ...record, ...record?.portInDetails });
        if (
            record.billingAccountNumber ===
            window[window.sessionStorage?.tabId].alasql.tables
                .datasource_360_customer_view.data[0].account
                .billingAccountNumber
        ) {
            setNeedsAuth(false);
        }
        if (needsAuth) {
            window[window.sessionStorage?.tabId][
                'sendorders-auth-async-machine'
            ]('APPEND.URL', {
                value: `/${record.billingAccountNumber}`,
            });
            window[window.sessionStorage?.tabId][
                'sendorders-auth-async-machine'
            ]('FETCH');
        }
    };

    const getFeatureData = (featureKey) => {
        const featureFlag = plugin.invoke('features.evaluate', featureKey);
        return featureFlag && featureFlag[0];
    };

    const fetchLastSearchOrder = () => {
        setActivateBackButton(false);
        let lastOrderSearchParams = cache.get('lastOrderSearchParams');
        if (lastOrderSearchParams) {
            fetchDataWithParams(JSON.parse(lastOrderSearchParams));
        }
    };

    const activityFeatureFlag = getFeatureData('activityManagement');

    return activityFeatureFlag && !activityFeatureFlag.enabled ? (
        <Alert
            className="payments-alert"
            message={`Track order is disabled ${
                activityFeatureFlag?.reasons?.length > 0
                    ? `due to ${activityFeatureFlag?.reasons.toString()}`
                    : ''
            }`}
            type="info"
            showIcon
        />
    ) : (
        <div className="order-list-background">
            {activateBackButton && (
                <Row className="cta-back-button">
                    <Col
                        style={{
                            display: 'flex',
                            cursor: 'pointer',
                            gap: '4px',
                        }}
                        onClick={() => fetchLastSearchOrder()}
                    >
                        <ArrowLeftOutlined style={{ margin: 'auto 0' }} />
                        {backButtonString}
                    </Col>
                </Row>
            )}

            <div className="order-list-wrapper">
                {!order ? (
                    <>
                        <OrderListHeader
                            isLoading={isLoading}
                            fetchDataWithParams={fetchDataWithParams}
                            setActivateBackButton={setActivateBackButton}
                        />
                        {!finalData ? (
                            InitialView
                        ) : (
                            <OrderList
                                data={finalData}
                                isLoading={isLoading}
                                fetchDataWithParams={fetchDataWithParams}
                                handleActionClick={handleActionClick}
                                error={error}
                                fetchLastSearchOrder={fetchLastSearchOrder}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <Stepper
                            action={action}
                            needsAuth={needsAuth}
                            onClose={() => {
                                cache.remove('portEdit');
                                setOrder(undefined);
                                setNeedsAuth(true);
                                setSecurityQuestionData({});
                            }}
                        />
                        {needsAuth ? (
                            <Auth
                                workflows={properties?.workflows}
                                datasources={datasources}
                                securityQuestionData={securityQuestionData}
                                ban={order?.billingAccountNumber}
                                onSuccess={() => {
                                    setNeedsAuth(false);
                                }}
                            />
                        ) : (
                            <ActionFlow
                                order={order}
                                action={action}
                                workflows={properties?.workflows}
                                datasources={datasources}
                                fetchLastSearchOrder={fetchLastSearchOrder}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
