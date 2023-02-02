"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _componentMessageBus = require("@ivoyant/component-message-bus");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const {
  Text,
  Title
} = _antd.Typography;
const layout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 14
  }
};
const tailLayout = {
  wrapperCol: {
    offset: 6,
    span: 14
  }
};
const authVerifyResponse = (successStates, errorStates, setIsLoading, onSuccess, setErrorMsg) => (subscriptionId, topic, eventData, closure) => {
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
    _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
  }
};
function Auth(_ref) {
  let {
    securityQuestionData,
    ban,
    onSuccess,
    datasources,
    workflows
  } = _ref;
  const [form] = _antd.Form.useForm();
  const [radioVal, setRadioVal] = (0, _react.useState)();
  const [isLoading, setIsLoading] = (0, _react.useState)(false);
  const [errorMsg, setErrorMsg] = (0, _react.useState)();
  const {
    validateCustomer
  } = workflows;
  const {
    workflow,
    datasource,
    responseMapping,
    successStates,
    errorStates
  } = validateCustomer;
  const isInputBlank = () => {
    const {
      receivedPin,
      securityAnswer
    } = form.getFieldsValue();
    const fieldMapping = {
      pin: receivedPin,
      sqa: securityAnswer
    };
    return !fieldMapping[radioVal];
  };
  const onFinish = values => {
    setIsLoading(true);
    setErrorMsg('');
    let value = {};
    if (radioVal === 'pin') {
      value = {
        pin: values.receivedPin
      };
    }
    if (radioVal === 'sqa') {
      value = {
        securityAnswer: {
          questionCode: securityQuestionData.questionCode,
          answer: values.securityAnswer
        }
      };
    }
    const registrationId = workflow.concat('.').concat(securityQuestionData.billingAccountNumber || ban);
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), authVerifyResponse(successStates, errorStates, setIsLoading, onSuccess, setErrorMsg));
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow: workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow: workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[datasource],
        request: {
          params: {
            targetAccount: securityQuestionData.billingAccountNumber || ban
          },
          body: value
        },
        responseMapping
      }
    });
  };
  const onFinishFailed = errorInfo => {};
  const onRadioChange = e => {
    setRadioVal(e.target.value);
    form.resetFields(['receivedPin', 'securityAnswer']);
    // form.resetFields(['receivedPin', 'securityAnswer', 'bypassAnswer']);
  };

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "view-container"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "content-title"
  }, /*#__PURE__*/_react.default.createElement(Title, {
    level: 4
  }, "Account Authentication")), /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex justify-content-center align-items-center flex-column"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "alert-container"
  }, errorMsg && /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: errorMsg,
    type: "error",
    showIcon: true
  })), /*#__PURE__*/_react.default.createElement(_antd.Form, {
    style: {
      minWidth: 680
    },
    form: form,
    onFinish: onFinish,
    onFinishFailed: onFinishFailed
  }, /*#__PURE__*/_react.default.createElement(_antd.Radio.Group, {
    style: {
      width: '100%'
    },
    onChange: onRadioChange,
    value: radioVal
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "radio-option-boxes"
  }, /*#__PURE__*/_react.default.createElement(_antd.Radio, {
    value: "pin"
  }, "PIN"), /*#__PURE__*/_react.default.createElement("div", {
    className: "radio-option-content"
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, _extends({}, layout, {
    name: "receivedPin",
    label: "Received PIN"
  }), /*#__PURE__*/_react.default.createElement(_antd.Input.Password, {
    placeholder: "Enter received PIN code",
    disabled: radioVal !== 'pin',
    visibilityToggle: false,
    autoComplete: "off",
    className: "fs-exclude"
  })))), /*#__PURE__*/_react.default.createElement("div", {
    className: "radio-option-boxes"
  }, /*#__PURE__*/_react.default.createElement(_antd.Radio, {
    value: "sqa"
  }, "Security Question"), /*#__PURE__*/_react.default.createElement("div", {
    className: "radio-option-content"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "security-question"
  }, /*#__PURE__*/_react.default.createElement(_icons.QuestionCircleOutlined, {
    style: {
      fontSize: 18,
      marginRight: 12
    }
  }), /*#__PURE__*/_react.default.createElement(Text, {
    strong: true,
    disabled: radioVal !== 'sqa'
  }, securityQuestionData?.question || 'Loading...')), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, _extends({}, layout, {
    name: "securityAnswer",
    label: "Security Answer"
  }), /*#__PURE__*/_react.default.createElement(_antd.Input, {
    placeholder: "Enter security answer",
    disabled: radioVal !== 'sqa',
    autoComplete: "off",
    className: "fs-exclude"
  }))))), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    wrapperCol: {
      offset: 18,
      span: 6
    },
    shouldUpdate: true
  }, () => /*#__PURE__*/_react.default.createElement(_antd.Button, {
    block: true,
    type: "primary",
    htmlType: "submit",
    loading: isLoading,
    disabled: isInputBlank()
  }, "Next")))));
}
var _default = Auth;
exports.default = _default;
module.exports = exports.default;