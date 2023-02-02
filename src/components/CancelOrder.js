import React, { useState, useEffect } from 'react';
import { Typography, Spin } from 'antd';
import StatusFeedback from './StatusFeedback';
import { MessageBus } from '@ivoyant/component-message-bus';
const MakingApiRequestView = (
    <div className="content">
        <div className="element">
            <Spin size="large" />
        </div>
        <div className="element text-center">
            <Typography.Title level={3}>Cancelling order...</Typography.Title>
        </div>
    </div>
);

function CancelOrder({ order, workflows, datasources }) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState();
    const [msg, setMsg] = useState();

    useEffect(() => {
        handleCancelOrder();
    }, []);

    const handleCancelOrder = () => {
        setIsLoading(true);
        const {
            workflow,
            datasource,
            successStates,
            errorStates,
            responseMapping,
        } = workflows?.cancelOrder;

        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: workflow,
                workflow,
                eventType: 'INIT',
            },
        });

        MessageBus.subscribe(
            workflow,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleCancelOrderResponse(successStates, errorStates),
            {}
        );

        MessageBus.send('WF.'.concat(workflow).concat('.').concat('SUBMIT'), {
            header: {
                registrationId: workflow,
                workflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource: datasources[datasource],
                request: {
                    params: { uuid: order?.uuid },
                },
                responseMapping,
            },
        });
    };

    const handleCancelOrderResponse = (successStates, errorStates) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const state = eventData.value;
        const isSuccess = successStates.includes(state);
        const isFailure = errorStates.includes(state);
        if (isSuccess || isFailure) {
            if (isSuccess) {
                setStatus('success');
                setMsg('Successfully cancelled the order!');
            }

            if (isFailure) {
                setStatus('error');
                setMsg(
                    eventData?.event?.data?.message || 'Error cancelling order!'
                );
            }
            setIsLoading(false);

            MessageBus.unsubscribe(subscriptionId);
        }
    };

    return (
        <div className="view-container d-flex justify-content-center align-items-center">
            {isLoading ? (
                MakingApiRequestView
            ) : (
                <StatusFeedback status={status} msg={msg} />
            )}
        </div>
    );
}

export default CancelOrder;
