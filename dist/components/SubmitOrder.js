"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _StatusFeedback = _interopRequireDefault(require("./StatusFeedback"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const fireConsentRequest = function () {
  let lines = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  let consentIdentifier = 'TC_CHANGE_SERVICES_V1';
  let consentRequestBody = lines?.length > 0 ? {
    createConsentRequestInfo: lines.map((line, index) => {
      return {
        uniqueIdentifier: `UNIQ_${index}`,
        consentType: 'TC',
        consentIdentifier: line?.lineStep === 'NEWLINE' ? addLineConsentIdentifier : consentIdentifier,
        status: 'ACCEPT',
        consentPartyIdentity: {
          firstName: window[sessionStorage?.tabId]?.alasql?.tables?.datasource_360_customer_view?.data?.[0]?.account?.name?.firstName ? window[sessionStorage?.tabId]?.alasql?.tables?.datasource_360_customer_view?.data?.[0]?.account?.name?.firstName : '',
          lastName: window[sessionStorage?.tabId]?.alasql?.tables?.datasource_360_customer_view?.data?.[0]?.account?.name?.lastName ? window[sessionStorage?.tabId]?.alasql?.tables?.datasource_360_customer_view?.data?.[0]?.account?.name?.lastName : '',
          type: 'CTN',
          value: line.customerTelephoneNumber ? line.customerTelephoneNumber : window[sessionStorage?.tabId]?.NEW_CTN
        },
        communicationAttributes: {
          ctn: line.customerTelephoneNumber ? line.customerTelephoneNumber : window[sessionStorage?.tabId]?.NEW_CTN
        }
      };
    })
  } : {
    createConsentRequestInfo: [{
      uniqueIdentifier: 'UNIQ_1',
      consentType: 'TC',
      consentIdentifier,
      status: 'ACCEPT',
      consentPartyIdentity: {
        firstName: window[sessionStorage?.tabId]?.alasql?.tables?.datasource_360_customer_view?.data?.[0]?.account?.name?.firstName ? window[sessionStorage?.tabId]?.alasql?.tables?.datasource_360_customer_view?.data?.[0]?.account?.name?.firstName : '',
        lastName: window[sessionStorage?.tabId]?.alasql?.tables?.datasource_360_customer_view?.data?.[0]?.account?.name?.lastName ? window[sessionStorage?.tabId]?.alasql?.tables?.datasource_360_customer_view?.data?.[0]?.account?.name?.lastName : '',
        type: 'CTN',
        value: window[sessionStorage?.tabId]?.NEW_CTN
      },
      communicationAttributes: {
        ctn: window[sessionStorage?.tabId]?.NEW_CTN
      }
    }]
  };
  window[sessionStorage.tabId]['sendtrack-order-crp-create-consent-data-async-machine']('SET.REQUEST.DATA', {
    value: consentRequestBody
  });
  window[sessionStorage.tabId]['sendtrack-order-crp-create-consent-data-async-machine']('FETCH');
};
const MakingApiRequestView = /*#__PURE__*/_react.default.createElement("div", {
  className: "content"
}, /*#__PURE__*/_react.default.createElement("div", {
  className: "element"
}, /*#__PURE__*/_react.default.createElement(_antd.Spin, {
  size: "large"
})), /*#__PURE__*/_react.default.createElement("div", {
  className: "element text-center"
}, /*#__PURE__*/_react.default.createElement(_antd.Typography.Title, {
  level: 3
}, "Submitting order...")));
function SubmitOrder(_ref) {
  let {
    order
  } = _ref;
  const [isLoading, setIsLoading] = (0, _react.useState)(false);
  const [status, setStatus] = (0, _react.useState)();
  const [msg, setMsg] = (0, _react.useState)();
  (0, _react.useEffect)(() => {
    setIsLoading(true);
    window[window.sessionStorage?.tabId]['sendsubmit-track-order-async-machine']('APPEND.URL', {
      value: `/${order.uuid}`
    });
    window[window.sessionStorage?.tabId]['sendsubmit-track-order-async-machine']('FETCH');
  }, []);
  const handleSubmitTrackOrderResponse = response => {
    if (response && response.payload) {
      const {
        responseStatus
      } = response.payload;
      if (responseStatus < 300) {
        setStatus('success');
        setMsg('Order was submitted successfully.');
        setIsLoading(false);
        fireConsentRequest(order?.lines);
      } else {
        setStatus('error');
        setMsg(response?.payload?.causedBy ? response?.payload?.causedBy[0]?.message : response?.payload?.message || 'Internal Server Error');
      }
    } else {
      setStatus('error');
      setMsg('Internal Server Error');
      setIsLoading(false);
    }
  };
  (0, _react.useEffect)(() => {
    window[window.sessionStorage?.tabId][`submitTrackOrderResponse`] = value => handleSubmitTrackOrderResponse(value);
    return () => {
      delete window[window.sessionStorage?.tabId][`submitTrackOrderResponse`];
    };
  });
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "view-container d-flex justify-content-center align-items-center"
  }, isLoading ? MakingApiRequestView : /*#__PURE__*/_react.default.createElement(_StatusFeedback.default, {
    status: status,
    msg: msg
  }));
}
var _default = SubmitOrder;
exports.default = _default;
module.exports = exports.default;