import React from 'react';
import { Table, Tag, Space, Button, Typography, Popover, Tooltip } from 'antd';
import moment from 'moment';
import {
    EditOutlined,
    StopOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { Actions, Tags } from '../helpers';
import { cache } from '@ivoyant/component-cache';

const { Text } = Typography;
const OrderList = ({
    data,
    isLoading,
    fetchDataWithParams,
    handleActionClick,
    error,
    parentProps = {},
    fetchLastSearchOrder,
}) => {
    const handleOrderIdClick = (orderid) => {
        fetchDataWithParams({ orderid });
    };

    const columns = [
        {
            dataIndex: 'orderId',
            title: 'Order ID',
            align: 'left',
            sorter: (a, b) => +a.orderId - +b.orderId,
            render: (text, record, index) => {
                const disabled =
                    record.orderStepStatus === 'CANCELLED' ||
                    record.orderStepStatus === 'FAILURE';
                const isOrderDetails = data?.length === 1;
                const legacyOrder = record?.isLegacyOrder;
                return legacyOrder ? (
                    <Tooltip title="Unsupported Voyage Order. Must be managed in ASAP">
                        <Button
                            type="link"
                            style={{ fontWeight: '600' }}
                            disabled
                        >
                            {text}
                        </Button>
                    </Tooltip>
                ) : isOrderDetails ? (
                    <Text strong>{text}</Text>
                ) : (
                    <Button
                        type="link"
                        style={{ fontWeight: '600' }}
                        disabled={disabled}
                        onClick={() => {
                            handleOrderIdClick(text);
                        }}
                    >
                        {text}
                    </Button>
                );
            },
        },
        {
            dataIndex: 'billingAccountNumber',
            title: 'Account Number',
            align: 'left',
            sorter: (a, b) => +a.billingAccountNumber - +b.billingAccountNumber,
        },
        {
            dataIndex: 'firstName',
            title: 'First Name',
            align: 'left',
            sorter: (a, b) =>
                a.firstName.localeCompare(b.firstName, 'en', {
                    sensitivity: 'base',
                }),
        },
        {
            dataIndex: 'lastName',
            title: 'Last Name',
            align: 'left',
            sorter: (a, b) =>
                a.lastName.localeCompare(b.lastName, 'en', {
                    sensitivity: 'base',
                }),
        },
        {
            dataIndex: 'orderStep',
            title: 'Step',
            align: 'left',
            sorter: (a, b) =>
                a.lastName.localeCompare(b.orderStep, 'en', {
                    sensitivity: 'base',
                }),
        },
        {
            dataIndex: 'orderStepStatus',
            title: 'Status',
            align: 'left',
            // filters: orderFilters,
            sorter: (a, b) =>
                a.orderStepStatus.localeCompare(b.orderStepStatus, 'en', {
                    sensitivity: 'base',
                }),
            render: (text, record) => {
                const isOrderDetails = data?.length === 1;
                const isPaymentDue =
                    record.orderStepStatus === 'OKTOSUBMIT' &&
                    (record.orderDueAmount !== undefined &&
                    record?.accountBalance !== undefined &&
                    record.orderDueAmount + record?.accountBalance > 0
                        ? true
                        : false);
                const title = isPaymentDue ? 'PAYMENTPENDING' : text;
                const legacyOrder = record?.isLegacyOrder;
                const content = isOrderDetails ? (
                    <div>
                        <p>Line of business: {record.lineOfBusiness}</p>
                        {isPaymentDue ? (
                            (record.orderDueAmount ||
                                typeof record.orderDueAmount !==
                                    'undefined') && (
                                <>
                                    <p>Order step : Make Payment</p>
                                    <p>
                                        Order due amount : $
                                        {Number(record.orderDueAmount).toFixed(
                                            2
                                        )}
                                        .
                                    </p>
                                    <p>
                                        Go to make a payment and complete the
                                        payment for the Order Due Amount.
                                    </p>
                                    <p>
                                        Note : The Account you are logged in
                                        could be different from the Order
                                        Account
                                    </p>
                                </>
                            )
                        ) : (
                            <>
                                {record.orderStep && (
                                    <p>Order step : {record.orderStep}</p>
                                )}
                                {record.orderStepStatus && (
                                    <p>
                                        Order step status :{' '}
                                        {record.orderStepStatus}
                                    </p>
                                )}
                            </>
                        )}
                        {record?.internalOrderTrackingStatusInfo?.message &&
                            record.orderStep !== 'CANCEL' && (
                                <p>
                                    Message:{' '}
                                    {
                                        record?.internalOrderTrackingStatusInfo
                                            ?.message
                                    }
                                </p>
                            )}
                    </div>
                ) : (
                    <></>
                );
                return isOrderDetails ? (
                    <>
                        <Tag color={Tags[title].color}>{Tags[title].title}</Tag>
                        <Popover content={content}>
                            <Button
                                type="link"
                                shape="circle"
                                icon={<InfoCircleOutlined />}
                            />
                        </Popover>
                    </>
                ) : (
                    <Tag color={legacyOrder ? 'default' : Tags[title].color}>
                        {Tags[title].title}
                    </Tag>
                );
            },
        },
        {
            dataIndex: 'orderDate',
            title: 'Date',
            sorter: (a, b) => {
                const aDate = new Date(a.orderDate);
                const bDate = new Date(b.orderDate);
                // eslint-disable-next-line no-nested-ternary
                return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
            },
            render: (text) => moment(text).format('YYYY-MM-DD'),
        },

        {
            render: (_, record) => {
                const enableUpdate =
                    !record?.internalOrderTrackingStatusInfo
                        ?.blockOrderIndicator &&
                    record?.internalOrderTrackingStatusInfo?.allowUpdateOrder;

                const cancelDisabled = !record?.internalOrderTrackingStatusInfo
                    ?.allowCancelOrder;

                const disableSubmit =
                    cancelDisabled ||
                    record?.internalOrderTrackingStatusInfo
                        ?.blockOrderIndicator ||
                    (record.orderDueAmount !== undefined &&
                        record?.accountBalance !== undefined &&
                        record.orderDueAmount + record?.accountBalance > 0)
                        ? true
                        : false;

                return (
                    <Space size="middle">
                        {record.orderStepStatus !== 'OKTOSUBMIT' ||
                        enableUpdate ? (
                            <Button
                                type="link"
                                shape="circle"
                                disabled={!enableUpdate}
                                onClick={() =>
                                    handleActionClick(Actions.UPDATE, record)
                                }
                                icon={<EditOutlined />}
                            />
                        ) : (
                            <Button
                                type="link"
                                shape="circle"
                                disabled={disableSubmit}
                                onClick={() =>
                                    handleActionClick(Actions.SUBMIT, record)
                                }
                                icon={<CheckCircleOutlined />}
                            />
                        )}
                        <Button
                            type="link"
                            shape="circle"
                            disabled={cancelDisabled}
                            onClick={() =>
                                handleActionClick(Actions.CANCEL, record)
                            }
                            icon={<StopOutlined />}
                        />
                        <Button
                            type="link"
                            shape="circle"
                            onClick={() =>
                                // handleActionClick(Actions.CANCEL, record)
                                fetchLastSearchOrder()
                            }
                            icon={<ReloadOutlined />}
                        />
                    </Space>
                );
            },
        },
    ];

    let finalColumns = columns.filter((_, index, colArray) => {
        const includeActionBtns = data.length === 1;
        return includeActionBtns || index !== colArray.length - 1;
    });

    // the filter to show or hide columns in track order table, based on the number of orders we are getting from API.
    // If only one row is coming then show the order step and order step status column, else we hide them.

    if (data?.length !== 1) {
        finalColumns = finalColumns.filter(
            (col) =>
                col.dataIndex !== 'orderStep' &&
                col.dataIndex !== 'orderStepStatus'
        );
    }

    const checkLineForEdit = (lines, customerTelephoneNumber) => {
        const currentLine = lines?.find(
            (l) => l?.customerTelephoneNumber === customerTelephoneNumber
        );
        return currentLine?.lineActions?.updatePortDetails ? true : false;
    };

    const expandedRowRender = () => {
        const columns = [
            {
                title: 'Phone Number',
                dataIndex: 'customerTelephoneNumber',
                key: 'customerTelephoneNumber',
            },
            {
                title: 'Line Step',
                dataIndex: 'lineStep',
                key: 'lineStep',
            },
            {
                title: 'Line Step Status',
                dataIndex: 'lineStepStatus',
                key: 'lineStepStatus',
                render: (text, record) => {
                    return <>{text}</>;
                },
            },
            {
                title: 'Line Step Details',
                dataIndex: 'lineStepDetails',
                key: 'lineStepDetails',
                render: (data) => {
                    return <> {data?.length > 0 && data[0]?.message}</>;
                },
            },
            {
                title: 'Port In Status Text',
                dataIndex: 'portInDetails',
                key: 'portInDetails',
                render: (data) => {
                    return (
                        <>
                            <Tooltip
                                placement="topRight"
                                title={
                                    data?.portInRequestStatus
                                        ?.portInStatusDescription
                                }
                            >
                                {
                                    data?.portInRequestStatus
                                        ?.portInRequestStatusText
                                }
                            </Tooltip>
                        </>
                    );
                },
            },
            {
                title: 'Due Date/Time',
                dataIndex: 'portInDetails',
                key: 'portInDetails date',
                ellipsis: {
                    showTitle: false,
                },
                render: (data) => (
                    <>
                        {data?.portInRequestStatus?.portInEstimatedDueDate
                            ? moment
                                  .tz(
                                      moment(
                                          data?.portInRequestStatus
                                              ?.portInEstimatedDueDate
                                      ).format(),
                                      'America/New_York'
                                  )
                                  .format('DD MMM YYYY  / HH:mm a')
                            : 'N/A'}
                    </>
                ),
            },
            {
                render: (dt, record) => {
                    const enableUpdate = checkLineForEdit(
                        data[0]?.internalOrderTrackingStatusInfo?.lines,
                        record?.customerTelephoneNumber
                    );
                    return (
                        <>
                            <Button
                                type="link"
                                shape="circle"
                                disabled={!enableUpdate}
                                onClick={() => {
                                    cache.put('portEdit', true);
                                    handleActionClick(Actions.UPDATE, {
                                        ...record,
                                        billingAccountNumber:
                                            data[0]?.billingAccountNumber,
                                        firstName: data[0]?.firstName,
                                        lastName: data[0]?.lastName,
                                        orderStepStatus: data[0]?.orderStepStatus,
                                        orderTrackingStatusInfo: data[0]?.orderTrackingStatusInfo,
                                        orderDate: data[0]?.orderDate,
                                        lines: data[0]?.lines,
                                        internalOrderTrackingStatusInfo: data[0]?.internalOrderTrackingStatusInfo,
                                        uuid: data[0]?.uuid
                                    });
                                }}
                                icon={<EditOutlined />}
                            />
                        </>
                    );
                },
            },
        ];

        return (
            <Table
                columns={columns}
                dataSource={data[0].lines}
                pagination={false}
            />
        );
    };

    return (
        <div className="order-list">
            <Table
                className="order-list-table"
                loading={isLoading}
                pagination={{ pageSize: 9 }}
                columns={finalColumns}
                dataSource={data}
                expandable={{
                    defaultExpandAllRows: true,
                    expandedRowRender:
                        data?.length === 1 ? expandedRowRender : false,
                }}
                locale={{ emptyText: error }}
            />
        </div>
    );
};

export default OrderList;
