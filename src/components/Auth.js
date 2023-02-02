import React, { useState, useEffect } from 'react';
import { Form, Radio, Input, Typography, Button, Alert } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { MessageBus } from '@ivoyant/component-message-bus';

const { Text, Title } = Typography;

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
};

const tailLayout = {
    wrapperCol: { offset: 6, span: 14 },
};
const authVerifyResponse = (
    successStates,
    errorStates,
    setIsLoading,
    onSuccess,
    setErrorMsg
) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
        setIsLoading(false);
        if (isSuccess) {
            onSuccess();
        }
        if (isFailure) {
            setErrorMsg(eventData?.data?.message);
        }
        MessageBus.unsubscribe(subscriptionId);
    }
};

function Auth({
    securityQuestionData,
    ban,
    onSuccess,
    datasources,
    workflows,
}) {
    const [form] = Form.useForm();
    const [radioVal, setRadioVal] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState();
    const { validateCustomer } = workflows;
    const {
        workflow,
        datasource,
        responseMapping,
        successStates,
        errorStates,
    } = validateCustomer;

    const isInputBlank = () => {
        const { receivedPin, securityAnswer } = form.getFieldsValue();
        const fieldMapping = {
            pin: receivedPin,
            sqa: securityAnswer,
        };
        return !fieldMapping[radioVal];
    };

    const onFinish = (values) => {
        setIsLoading(true);
        setErrorMsg('');
        let value = {};
        if (radioVal === 'pin') {
            value = { pin: values.receivedPin };
        }
        if (radioVal === 'sqa') {
            value = {
                securityAnswer: {
                    questionCode: securityQuestionData.questionCode,
                    answer: values.securityAnswer,
                },
            };
        }

        const registrationId = workflow
            .concat('.')
            .concat(securityQuestionData.billingAccountNumber || ban);
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            authVerifyResponse(
                successStates,
                errorStates,
                setIsLoading,
                onSuccess,
                setErrorMsg
            )
        );
        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow: workflow,
                eventType: 'INIT',
            },
        });
        MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow: workflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource: datasources[datasource],
                request: {
                    params: {
                        targetAccount:
                            securityQuestionData.billingAccountNumber || ban,
                    },
                    body: value,
                },
                responseMapping,
            },
        });
    };

    const onFinishFailed = (errorInfo) => {};

    const onRadioChange = (e) => {
        setRadioVal(e.target.value);
        form.resetFields(['receivedPin', 'securityAnswer']);
        // form.resetFields(['receivedPin', 'securityAnswer', 'bypassAnswer']);
    };

    return (
        <div className="view-container">
            <div className="content-title">
                <Title level={4}>Account Authentication</Title>
            </div>
            <div className="d-flex justify-content-center align-items-center flex-column">
                <div className="alert-container">
                    {errorMsg && (
                        <Alert message={errorMsg} type="error" showIcon />
                    )}
                </div>
                <Form
                    style={{ minWidth: 680 }}
                    form={form}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Radio.Group
                        style={{ width: '100%' }}
                        onChange={onRadioChange}
                        value={radioVal}
                    >
                        <div className="radio-option-boxes">
                            <Radio value="pin">PIN</Radio>
                            <div className="radio-option-content">
                                <Form.Item
                                    {...layout}
                                    name="receivedPin"
                                    label="Received PIN"
                                >
                                    <Input.Password
                                        placeholder="Enter received PIN code"
                                        disabled={radioVal !== 'pin'}
                                        visibilityToggle={false}
                                        autoComplete="off"
                                        className="fs-exclude"
                                    />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="radio-option-boxes">
                            <Radio value="sqa">Security Question</Radio>
                            <div className="radio-option-content">
                                <div className="security-question">
                                    <QuestionCircleOutlined
                                        style={{
                                            fontSize: 18,
                                            marginRight: 12,
                                        }}
                                    />
                                    <Text strong disabled={radioVal !== 'sqa'}>
                                        {securityQuestionData?.question ||
                                            'Loading...'}
                                    </Text>
                                </div>
                                <Form.Item
                                    {...layout}
                                    name="securityAnswer"
                                    label="Security Answer"
                                >
                                    <Input
                                        placeholder="Enter security answer"
                                        disabled={radioVal !== 'sqa'}
                                        autoComplete="off"
                                        className="fs-exclude"
                                    />
                                </Form.Item>
                            </div>
                        </div>
                    </Radio.Group>
                    <Form.Item
                        wrapperCol={{ offset: 18, span: 6 }}
                        shouldUpdate
                    >
                        {() => (
                            <Button
                                block
                                type="primary"
                                htmlType="submit"
                                loading={isLoading}
                                disabled={isInputBlank()}
                            >
                                Next
                            </Button>
                        )}
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

export default Auth;
