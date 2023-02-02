import React, { useState, useEffect } from 'react';
import { Typography, Spin } from 'antd';
import StatusFeedback from './StatusFeedback';

const fireConsentRequest = (lines = []) => {
    let consentIdentifier = 'TC_CHANGE_SERVICES_V1';
    let consentRequestBody =
        lines?.length > 0
            ? {
                  createConsentRequestInfo: lines.map((line, index) => {
                      return {
                          uniqueIdentifier: `UNIQ_${index}`,
                          consentType: 'TC',
                          consentIdentifier:
                              line?.lineStep === 'NEWLINE'
                                  ? addLineConsentIdentifier
                                  : consentIdentifier,
                          status: 'ACCEPT',
                          consentPartyIdentity: {
                              firstName: window[sessionStorage?.tabId]?.alasql
                                  ?.tables?.datasource_360_customer_view
                                  ?.data?.[0]?.account?.name?.firstName
                                  ? window[sessionStorage?.tabId]?.alasql
                                        ?.tables?.datasource_360_customer_view
                                        ?.data?.[0]?.account?.name?.firstName
                                  : '',
                              lastName: window[sessionStorage?.tabId]?.alasql
                                  ?.tables?.datasource_360_customer_view
                                  ?.data?.[0]?.account?.name?.lastName
                                  ? window[sessionStorage?.tabId]?.alasql
                                        ?.tables?.datasource_360_customer_view
                                        ?.data?.[0]?.account?.name?.lastName
                                  : '',
                              type: 'CTN',
                              value: line.customerTelephoneNumber
                                  ? line.customerTelephoneNumber
                                  : window[sessionStorage?.tabId]?.NEW_CTN,
                          },
                          communicationAttributes: {
                              ctn: line.customerTelephoneNumber
                                  ? line.customerTelephoneNumber
                                  : window[sessionStorage?.tabId]?.NEW_CTN,
                          },
                      };
                  }),
              }
            : {
                  createConsentRequestInfo: [
                      {
                          uniqueIdentifier: 'UNIQ_1',
                          consentType: 'TC',
                          consentIdentifier,
                          status: 'ACCEPT',
                          consentPartyIdentity: {
                              firstName: window[sessionStorage?.tabId]?.alasql
                                  ?.tables?.datasource_360_customer_view
                                  ?.data?.[0]?.account?.name?.firstName
                                  ? window[sessionStorage?.tabId]?.alasql
                                        ?.tables?.datasource_360_customer_view
                                        ?.data?.[0]?.account?.name?.firstName
                                  : '',
                              lastName: window[sessionStorage?.tabId]?.alasql
                                  ?.tables?.datasource_360_customer_view
                                  ?.data?.[0]?.account?.name?.lastName
                                  ? window[sessionStorage?.tabId]?.alasql
                                        ?.tables?.datasource_360_customer_view
                                        ?.data?.[0]?.account?.name?.lastName
                                  : '',
                              type: 'CTN',
                              value: window[sessionStorage?.tabId]?.NEW_CTN,
                          },
                          communicationAttributes: {
                              ctn: window[sessionStorage?.tabId]?.NEW_CTN,
                          },
                      },
                  ],
              };
    window[sessionStorage.tabId][
        'sendtrack-order-crp-create-consent-data-async-machine'
    ]('SET.REQUEST.DATA', { value: consentRequestBody });
    window[sessionStorage.tabId][
        'sendtrack-order-crp-create-consent-data-async-machine'
    ]('FETCH');
};

const MakingApiRequestView = (
    <div className="content">
        <div className="element">
            <Spin size="large" />
        </div>
        <div className="element text-center">
            <Typography.Title level={3}>Submitting order...</Typography.Title>
        </div>
    </div>
);

function SubmitOrder({ order }) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState();
    const [msg, setMsg] = useState();

    useEffect(() => {
        setIsLoading(true);
        window[window.sessionStorage?.tabId][
            'sendsubmit-track-order-async-machine'
        ]('APPEND.URL', {
            value: `/${order.uuid}`,
        });
        window[window.sessionStorage?.tabId][
            'sendsubmit-track-order-async-machine'
        ]('FETCH');
    }, []);

    const handleSubmitTrackOrderResponse = (response) => {
        if (response && response.payload) {
            const { responseStatus } = response.payload;
            if (responseStatus < 300) {
                setStatus('success');
                setMsg('Order was submitted successfully.');
                setIsLoading(false);
                fireConsentRequest(order?.lines);
            } else {
                setStatus('error');
                setMsg(
                    response?.payload?.causedBy
                        ? response?.payload?.causedBy[0]?.message
                        : response?.payload?.message || 'Internal Server Error'
                );
            }
        } else {
            setStatus('error');
            setMsg('Internal Server Error');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        window[window.sessionStorage?.tabId][`submitTrackOrderResponse`] = (
            value
        ) => handleSubmitTrackOrderResponse(value);

        return () => {
            delete window[window.sessionStorage?.tabId][
                `submitTrackOrderResponse`
            ];
        };
    });

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

export default SubmitOrder;
