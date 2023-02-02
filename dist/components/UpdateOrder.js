"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _moment = _interopRequireDefault(require("moment"));
var _helpers = require("../helpers");
var _StatusFeedback = _interopRequireDefault(require("./StatusFeedback"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _componentCache = require("@ivoyant/component-cache");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/* eslint-disable prefer-promise-reject-errors */

const {
  Text
} = _antd.Typography;
const isLuhn = value => {
  let nCheck = 0;
  let bEven = false;
  const newValue = value.replace(/\D/g, '');
  for (let n = newValue.length - 1; n >= 0; n--) {
    const cDigit = newValue.charAt(n);
    let nDigit = parseInt(cDigit, 10);
    if (bEven && (nDigit *= 2) > 9) nDigit -= 9;
    nCheck += nDigit;
    bEven = !bEven;
  }
  return nCheck % 10 == 0;
};
const isValidIMEI = imei => {
  return imei.trim().length === 15 && isLuhn(imei.trim());
};
const isValidSIM = sim => {
  return sim.match(/^(89)(01)(150|030|170|410|560|680)(\d{13})/g) != null && isLuhn(sim);
};
function UpdateOrder(_ref) {
  let {
    order,
    workflows,
    datasources,
    fetchLastSearchOrder
  } = _ref;
  const [form] = _antd.Form.useForm();
  const [loading, setLoading] = (0, _react.useState)(false);
  const [showConfirmation, setShowConfirmation] = (0, _react.useState)(false);
  const [errorMsg, setErrorMsg] = (0, _react.useState)();
  const [formValues, setFormValues] = (0, _react.useState)({});
  const {
    orderId,
    billingAccountNumber,
    firstName,
    lastName,
    orderStepStatus,
    orderTrackingStatusInfo,
    orderDate,
    lines,
    internalOrderTrackingStatusInfo,
    uuid,
    otherAccountNumber,
    otherAccountPin,
    ssn,
    taxId,
    zipcode,
    customerTelephoneNumber
  } = order;
  const simRequired = internalOrderTrackingStatusInfo?.simRequired;
  const allowLinesInfo = internalOrderTrackingStatusInfo?.lines.find(_ref2 => {
    let {
      lineActions
    } = _ref2;
    return lineActions?.updateSim || lineActions?.updateImei;
  });
  const allowLinesPortInInfo = orderStepStatus === 'INPROGRESS' && internalOrderTrackingStatusInfo?.lines.find(_ref3 => {
    let {
      lineStep,
      lineStepStatus
    } = _ref3;
    return lineStep === 'PORTIN' && lineStepStatus === 'RESOLUTIONREQ';
  });
  const disableSimImei = orderStepStatus !== 'CREATED' && !allowLinesInfo;
  (0, _react.useEffect)(() => {
    return () => {
      sessionStorage.removeItem('orderFormValues');
    };
  }, []);
  (0, _react.useEffect)(() => {
    let formValuesObject = {
      ...formValues
    };
    if (_componentCache.cache.get('portEdit')) {
      let formFieldsObj = {};
      formFieldsObj[`${otherAccountNumber}-accNum`] = otherAccountNumber;
      formFieldsObj[`${otherAccountNumber}-pin`] = otherAccountPin;
      formFieldsObj[`${otherAccountNumber}-ssn`] = ssn;
      formFieldsObj[`${otherAccountNumber}-taxId`] = taxId;
      formFieldsObj[`${otherAccountNumber}-zipcode`] = zipcode;
      form.setFieldsValue(formFieldsObj);
      const formErrors = form.getFieldsError();
      const showValidate = !formErrors?.filter(_ref4 => {
        let {
          name
        } = _ref4;
        return name?.includes(`${customerTelephoneNumber}-sim`) || name?.includes(`${customerTelephoneNumber}-imei`);
      })?.find(_ref5 => {
        let {
          errors
        } = _ref5;
        return errors?.length > 0;
      });
      formValuesObject = {
        ...formValuesObject,
        ...formFieldsObj,
        otherAccountNumber,
        otherAccountPin,
        ssn,
        taxId,
        zipcode
      };
    }
    if (!_componentCache.cache.get('portEdit')) {
      lines.forEach(currentLine => {
        const {
          newDeviceInfo,
          newSimInfo,
          portInDetails,
          customerTelephoneNumber
        } = currentLine;
        const {
          imei
        } = newDeviceInfo;
        const {
          sim
        } = newSimInfo;
        // let otherAccountNumber = '';
        // let otherAccountPin = '';
        // let taxId = '';
        // let otherAccountNumber = '';
        const {
          otherAccountNumber = '',
          otherAccountPin = '',
          taxId = '',
          zipcode = ''
        } = portInDetails || {};
        let formFieldsObj = {};
        formFieldsObj[`${customerTelephoneNumber}-sim`] = getValue(sim);
        formFieldsObj[`${customerTelephoneNumber}-imei`] = getValue(imei);
        formFieldsObj[`${customerTelephoneNumber}-passcode`] = otherAccountPin;
        formFieldsObj[`${customerTelephoneNumber}-accNum`] = otherAccountNumber;
        formFieldsObj[`${customerTelephoneNumber}-zipcode`] = zipcode;
        formFieldsObj[`${customerTelephoneNumber}-ssn`] = taxId;
        form.setFieldsValue(formFieldsObj);
        const formErrors = form.getFieldsError();
        const showValidate = !formErrors?.filter(_ref6 => {
          let {
            name
          } = _ref6;
          return name?.includes(`${customerTelephoneNumber}-sim`) || name?.includes(`${customerTelephoneNumber}-imei`);
        })?.find(_ref7 => {
          let {
            errors
          } = _ref7;
          return errors?.length > 0;
        });
        formValuesObject[customerTelephoneNumber] = {
          ...formValuesObject[customerTelephoneNumber],
          showValidate,
          sim,
          imei,
          otherAccountPin,
          otherAccountNumber,
          zipcode,
          taxId
        };
      });
    }
    setFormValues(formValuesObject);
  }, [order]);
  const onFinish = () => {
    setErrorMsg('');
    setLoading(true);
    if (_componentCache.cache.get('portEdit')) {
      handleUpdatePortInDetail();
    } else {
      let requestBody = {
        billingAccountNumber
      };
      let portDetails = [];
      let linesInfo = [];
      if (Object.keys(formValues).length) {
        Object.entries(formValues).forEach(_ref8 => {
          let [key, value] = _ref8;
          if (value?.sim || value?.imei) {
            linesInfo.push({
              ctn: key,
              sim: value?.sim,
              imei: value?.imei
            });
          }
          if (value?.otherAccountPin || value?.otherAccountNumber || value?.zipcode) {
            if (value?.sim || value?.imei) {
              delete value?.sim;
              delete value?.imei;
            }
            portDetails.push({
              ctn: key,
              portDetails: {
                ...value,
                taxId: value?.taxId ? value?.taxId : 9999
              }
            });
          }
        });
        if (linesInfo.length > 0) {
          requestBody = {
            ...requestBody,
            linesEquipmentInfo: linesInfo
          };
        }
        if (portDetails.length > 0) {
          requestBody = {
            ...requestBody,
            portDetailsInfo: portDetails
          };
        }
      }
      if (linesInfo?.length > 0) {
        postValidateCall(linesInfo, requestBody);
      } else {
        handleUpdateOrder(requestBody);
      }
    }
  };
  const postValidateCall = (linesInfo, requestBody) => {
    const {
      workflow,
      datasource,
      responseMapping,
      successStates,
      errorStates
    } = workflows?.validateAddLine;
    const currentValues = linesInfo[0];
    const registrationId = workflow.concat(`.${currentValues?.ctn}`);
    if (checkValuePresence(currentValues?.imei) || simRequired && checkValuePresence(currentValues?.sim)) {
      _antd.notification['error']({
        message: `Valid SIM and IMEI`,
        description: 'Valid SIM and IMEI is Required'
      });
      setLoading(false);
    } else {
      let payloadObj = {
        imei: currentValues?.imei
      };
      if (simRequired || currentValues?.sim !== '' && isValidSIM(currentValues?.sim)) payloadObj = {
        ...payloadObj,
        iccid: currentValues?.sim
      };
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
          registrationId: registrationId,
          workflow: workflow,
          eventType: 'INIT'
        }
      });
      const newLines = linesInfo?.filter(_ref9 => {
        let {
          ctn
        } = _ref9;
        return ctn !== currentValues?.ctn;
      });
      _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), collectValidateResponse(currentValues?.ctn, requestBody, workflow, newLines, successStates, errorStates));
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
        header: {
          registrationId: registrationId,
          workflow: workflow,
          eventType: 'SUBMIT'
        },
        body: {
          datasource: datasources[datasource],
          request: {
            body: {
              ...payloadObj
            }
          },
          responseMapping
        }
      });
    }
  };
  const updateValueForPortInDetails = (subs, portDetails) => {
    let subIndex = subs?.findIndex(sb => sb?.subscriberDetails?.phoneNumber === customerTelephoneNumber);
    if (subIndex !== -1) subs[subIndex].subscriberDetails.portDetails = {
      ...subs[subIndex].subscriberDetails.portDetails,
      ...portDetails
    };
  };
  const updateLocalAlasqlCustomerAdditionalInfo = portDetails => {
    let subscribersFromAlasqlTable = window[sessionStorage?.tabId]?.alasql('select subscribers as subscribers from datasource_360_customer_additional_info');
    let subs = subscribersFromAlasqlTable[0].subscribers;
    updateValueForPortInDetails(subs, portDetails);
    window[sessionStorage?.tabId]?.alasql('update datasource_360_customer_additional_info set subscribers=?', [subs]);
    fetchLastSearchOrder();
  };
  const handleUpdatePortInDetailResponse = (successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        const responsePayload = eventData?.event.data?.data;
        setErrorMsg('');
        setShowConfirmation(true);
        updateLocalAlasqlCustomerAdditionalInfo(responsePayload);
      } else if (isFailure) {
        // On Error display the pop up with error
        setErrorMsg(eventData?.event?.data?.message || 'Error updating the order!');
      }
      setLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };

  /** Calls the update port in details api*/
  const handleUpdatePortInDetail = () => {
    const {
      workflow,
      datasource,
      successStates,
      errorStates,
      responseMapping
    } = workflows?.updatePortInDetails;
    if ('showValidate' in formValues) delete formValues['showValidate'];
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleUpdatePortInDetailResponse(successStates, errorStates), {});
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat('SUBMIT'), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[datasource],
        request: {
          body: {
            ...formValues
          },
          params: {
            ctn: customerTelephoneNumber
          }
        },
        responseMapping
      }
    });
  };
  const checkValuePresence = vl => {
    return vl === '' || vl < 1 || vl.split('').every(st => st === '0');
  };

  /** Calls the update the order api*/
  const handleUpdateOrder = requestBody => {
    const {
      workflow,
      datasource,
      successStates,
      errorStates,
      responseMapping
    } = workflows?.updateOrder;
    const sim = requestBody?.linesEquipmentInfo[0]?.sim;
    if (!simRequired && checkValuePresence(sim)) delete requestBody?.linesEquipmentInfo[0]?.sim;
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleUpdateOrderResponse(successStates, errorStates), {});
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat('SUBMIT'), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[datasource],
        request: {
          body: requestBody,
          params: {
            uuid: uuid
          }
        },
        responseMapping
      }
    });
  };

  // Collecting the validate response for add a line and updating the states and calling getPlansAndAddOns
  const collectValidateResponse = (number, requestBody, workflow, newLines, successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const status = eventData.value;
    const isSuccess = successStates.includes(status);
    const isFailure = errorStates.includes(status);
    if (isSuccess || isFailure) {
      if (isSuccess && subscriptionId === workflow.concat(`.${number}`)) {
        const responsePayload = JSON.parse(eventData?.event?.data?.request?.response);
        const simError = responsePayload?.iccidValidationResult?.faultInfo;
        const imeiError = responsePayload?.imeiValidationResult?.faultInfo;
        const rateCenterError = responsePayload?.rateCenter?.faultInfo;
        const formPrevValues = sessionStorage?.getItem('orderFormValues') ? JSON.parse(sessionStorage?.getItem('orderFormValues')) : {};
        if (simError || imeiError || rateCenterError) {
          let responseErrors = formPrevValues?.formErrors || [];
          if (simError) {
            responseErrors.push({
              name: `${number}-sim`,
              errors: simError ? [simError?.message] : null
            });
          }
          if (imeiError) {
            responseErrors.push({
              name: `${number}-imei`,
              errors: imeiError ? [imeiError?.message] : null
            });
          }
          sessionStorage?.setItem('orderFormValues', JSON.stringify({
            ...formPrevValues,
            formErrors: responseErrors
          }));
          form.setFields(responseErrors);
        } else {
          let values = formPrevValues?.validatedLines || [];
          if (!values?.includes(number)) {
            values.push(number);
            sessionStorage?.setItem('orderFormValues', JSON.stringify({
              ...formPrevValues,
              validatedLines: values
            }));
          }
          if (values?.length === requestBody?.linesEquipmentInfo?.length) {
            handleUpdateOrder(requestBody);
          }
        }
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
      if (newLines?.length > 0) {
        postValidateCall(newLines, requestBody);
      } else {
        sessionStorage?.removeItem('orderFormValues');
        setLoading(false);
      }
    }
  };
  const handleUpdateOrderResponse = (successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        const responsePayload = eventData?.event.data?.data;
        if (responsePayload?.linesEquipmentFaultInfo?.length > 0 && responsePayload?.linesEquipmentFaultInfo[0]?.equipmentFaultInfo || responsePayload?.linesPortInFaultInfo?.length > 0 && responsePayload?.linesPortInFaultInfo[0]?.faultInfo) {
          let lineErrorMessage = '';
          let portErrorMessage = '';
          if (responsePayload?.linesPortInFaultInfo?.length > 0 && responsePayload?.linesPortInFaultInfo[0]?.faultInfo) {
            portErrorMessage = responsePayload?.linesPortInFaultInfo?.map(_ref10 => {
              let {
                ctn,
                faultInfo
              } = _ref10;
              return `${ctn} : ${faultInfo?.message}`;
            })?.join('. ');
          }
          if (responsePayload?.linesEquipmentFaultInfo?.length > 0 && responsePayload?.linesEquipmentFaultInfo[0]?.equipmentFaultInfo) {
            lineErrorMessage = responsePayload?.linesEquipmentFaultInfo?.map(_ref11 => {
              let {
                ctn,
                equipmentFaultInfo
              } = _ref11;
              return `${ctn} : ${equipmentFaultInfo?.map(_ref12 => {
                let {
                  message
                } = _ref12;
                return message;
              })}`;
            })?.join('. ');
            responsePayload?.linesEquipmentFaultInfo[0]?.equipmentFaultInfo[0]?.message;
          }
          let errorMessage = `${portErrorMessage ? portErrorMessage : ''}  ${lineErrorMessage ? lineErrorMessage : ''}`;
          setErrorMsg(portErrorMessage || lineErrorMessage ? errorMessage : 'Error updating the order!');
        } else {
          setErrorMsg('');
          setShowConfirmation(true);
        }
      }

      // On Error display the pop up with error
      if (isFailure) {
        setErrorMsg(eventData?.event?.data?.message || 'Error updating the order!');
      }
      setLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const customValidator = (rule, value) => {
    if (rule.field?.includes('sim')) {
      return !value || isValidSIM(value) ? Promise.resolve() : Promise.reject(!value ? 'Please enter SIM' : 'Please enter a valid SIM');
    }
    if (rule.field?.includes('imei')) {
      return !value || isValidIMEI(value) ? Promise.resolve() : Promise.reject(!value ? 'Please enter IMEI' : 'Please enter a valid IMEI');
    }
  };
  const onFinishFailed = errorInfo => {};
  const first = [{
    label: 'Order ID',
    value: orderId
  }, {
    label: 'Account Number',
    value: billingAccountNumber
  }, {
    label: 'Account Name',
    value: `${lastName}, ${firstName}`
  }, {
    label: 'Date',
    value: (0, _moment.default)(orderDate).format('YYYY-MM-DD')
  }, {
    label: 'Status',
    value: orderStepStatus
  }];
  const portEditFields = [{
    label: 'Other Account Number',
    value: otherAccountNumber
  }, {
    label: 'Pin',
    value: otherAccountPin
  }, {
    label: 'SSN',
    value: ssn
  }, {
    label: 'Tax ID',
    value: taxId
  }, {
    label: 'Zipcode',
    value: zipcode
  }];
  const handleField = (value, name, phoneNumber) => {
    const formErrors = form.getFieldsError();
    const showValidate = !formErrors?.filter(_ref13 => {
      let {
        name
      } = _ref13;
      return name?.includes(`${phoneNumber}-sim`) || name?.includes(`${phoneNumber}-imei`);
    })?.find(_ref14 => {
      let {
        errors
      } = _ref14;
      return errors?.length > 0;
    });
    if (_componentCache.cache.get('portEdit')) {
      setFormValues({
        ...formValues,
        [name]: value,
        showValidate: showValidate
      });
    } else {
      setFormValues({
        ...formValues,
        [phoneNumber]: {
          ...formValues[phoneNumber],
          showValidate: showValidate,
          [name]: value
        }
      });
    }
  };
  const renderFields = () => {
    if (_componentCache.cache.get('portEdit')) {
      return portEditFields.map(_ref15 => {
        let {
          label,
          value
        } = _ref15;
        return /*#__PURE__*/_react.default.createElement(_antd.Row, {
          style: {
            margin: '8px 0'
          },
          key: label
        }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
          span: 12,
          style: {
            textAlign: 'right'
          }
        }, /*#__PURE__*/_react.default.createElement(Text, {
          type: "secondary",
          style: {
            marginRight: 12
          }
        }, label, ":")), label === 'Status' ? /*#__PURE__*/_react.default.createElement(_antd.Tag, {
          color: _helpers.Tags[value]?.color
        }, _helpers.Tags[value]?.title) : /*#__PURE__*/_react.default.createElement(_antd.Col, {
          span: 12
        }, /*#__PURE__*/_react.default.createElement(Text, {
          strong: true
        }, value)));
      });
    } else {
      return first.map(_ref16 => {
        let {
          label,
          value
        } = _ref16;
        return /*#__PURE__*/_react.default.createElement(_antd.Row, {
          style: {
            margin: '8px 0'
          },
          key: label
        }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
          span: 12,
          style: {
            textAlign: 'right'
          }
        }, /*#__PURE__*/_react.default.createElement(Text, {
          type: "secondary",
          style: {
            marginRight: 12
          }
        }, label, ":")), label === 'Status' ? /*#__PURE__*/_react.default.createElement(_antd.Tag, {
          color: _helpers.Tags[value]?.color
        }, _helpers.Tags[value]?.title) : /*#__PURE__*/_react.default.createElement(_antd.Col, {
          span: 12
        }, /*#__PURE__*/_react.default.createElement(Text, {
          strong: true
        }, value)));
      });
    }
  };
  const getValue = vl => {
    return vl < 1 || vl.split('').every(st => st === '0') ? '' : vl;
  };
  const getOrderFormFields = (customerTelephoneNumber, updateSim, updateImei, allowPortInfo, index) => {
    const currentLine = lines[index];
    const {
      newDeviceInfo,
      newSimInfo,
      portInDetails
    } = currentLine;
    const {
      imei
    } = newDeviceInfo;
    const {
      sim
    } = newSimInfo;
    const {
      otherAccountNumber = '',
      otherAccountPin = '',
      taxId = '',
      zipcode = ''
    } = portInDetails || {};
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
      gutter: 24,
      key: customerTelephoneNumber
    }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 6
    }, /*#__PURE__*/_react.default.createElement(_antd.Row, {
      style: {
        margin: '8px 0'
      }
    }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 12,
      style: {
        textAlign: 'right'
      }
    }, /*#__PURE__*/_react.default.createElement(Text, {
      type: "secondary",
      style: {
        marginRight: 12
      }
    }, "Phone Number :")), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 12
    }, /*#__PURE__*/_react.default.createElement(Text, {
      strong: true
    }, customerTelephoneNumber)))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 6
    }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
      label: "SIM",
      name: `${customerTelephoneNumber}-sim`,
      validateTrigger: "onChange",
      rules: simRequired ? [{
        required: updateSim,
        validator: customValidator,
        message: 'Please enter a valid SIM.'
      }] : false,
      normalize: value => value.replace(/[^0-9]/gi, ''),
      initialValue: getValue(sim)
    }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
      disabled: !updateSim,
      autoComplete: "off",
      onChange: e => handleField(e.target.value, 'sim', customerTelephoneNumber)
    })), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
      label: "IMEI",
      name: `${customerTelephoneNumber}-imei`,
      validateTrigger: "onChange",
      rules: [{
        required: updateImei,
        validator: customValidator,
        message: 'Please enter a valid IMEI.'
      }],
      normalize: value => value.replace(/[^0-9]/gi, ''),
      onChange: e => handleField(e.target.value, 'imei', customerTelephoneNumber),
      initialValue: getValue(imei)
    }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
      disabled: !updateImei,
      autoComplete: "off"
    }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 10
    }, /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 10,
      offset: 2
    }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
      label: "Passcode",
      name: `${customerTelephoneNumber}-passcode`,
      validateTrigger: "onBlur",
      rules: [{
        required: allowPortInfo ? true : false,
        message: 'Please enter valid PIN'
      }],
      normalize: value => value.replace(/[^0-9]/gi, ''),
      initialValue: otherAccountPin
    }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
      disabled: !allowPortInfo,
      autoComplete: "off",
      maxLength: 8,
      minLength: 4,
      onChange: e => handleField(e.target.value, 'otherAccountPin', customerTelephoneNumber)
    }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 10,
      offset: 2
    }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
      label: "Account Number",
      name: `${customerTelephoneNumber}-accNum`,
      rules: [{
        required: allowPortInfo ? true : false,
        message: 'Please enter the Account Number'
      }],
      normalize: value => value.replace(/[^0-9]/gi, ''),
      initialValue: otherAccountNumber
    }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
      disabled: !allowPortInfo,
      autoComplete: "off",
      onChange: e => handleField(e.target.value, 'otherAccountNumber', customerTelephoneNumber)
    })))), /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 10,
      offset: 2
    }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
      label: "Zip Code",
      name: `${customerTelephoneNumber}-zipcode`,
      validateTrigger: "onBlur",
      rules: [{
        required: allowPortInfo ? true : false,
        message: 'Please enter valid zip code'
      }],
      initialValue: zipcode
    }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
      disabled: !allowPortInfo,
      minLength: 5,
      maxLength: 5,
      autoComplete: "off",
      onChange: e => handleField(e.target.value, 'zipcode', customerTelephoneNumber)
    }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 10,
      offset: 2
    }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
      label: "Last 4 digits SSN",
      name: `${customerTelephoneNumber}-ssn`,
      normalize: value => value.replace(/[^0-9]/gi, ''),
      initialValue: taxId
    }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
      disabled: !allowPortInfo,
      autoComplete: "off",
      minLength: 4,
      maxLength: 4,
      onChange: e => handleField(e.target.value, 'taxId', customerTelephoneNumber),
      type: "password",
      className: "fs-exclude"
    })))))));
  };
  const getPortEditFields = () => {
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
      gutter: 24,
      key: otherAccountNumber
    }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 6
    }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
      label: "Account Number",
      name: `${otherAccountNumber}-accNum`,
      rules: [{
        required: true,
        message: 'Please enter the Account Number'
      }],
      normalize: value => value.replace(/[^0-9]/gi, ''),
      initialValue: otherAccountNumber
    }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
      autoComplete: "off",
      onChange: e => handleField(e.target.value, 'otherAccountNumber', otherAccountNumber)
    }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 6
    }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
      label: "PIN",
      name: `${otherAccountNumber}-pin`,
      validateTrigger: "onBlur",
      rules: [{
        required: true,
        message: 'Please enter valid PIN'
      }],
      normalize: value => value.replace(/[^0-9]/gi, ''),
      initialValue: otherAccountPin
    }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
      autoComplete: "off",
      maxLength: 8,
      minLength: 4,
      onChange: e => handleField(e.target.value, 'otherAccountPin', otherAccountNumber)
    }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 6
    }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
      label: "SSN",
      name: `${otherAccountNumber}-ssn`,
      normalize: value => value.replace(/[^0-9]/gi, ''),
      initialValue: ssn
    }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
      autoComplete: "off",
      minLength: 4,
      maxLength: 4,
      onChange: e => handleField(e.target.value, 'ssn', otherAccountNumber),
      type: "password",
      className: "fs-exclude"
    })))), /*#__PURE__*/_react.default.createElement(_antd.Row, {
      gutter: 24,
      key: otherAccountNumber
    }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 6
    }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
      label: "TAX ID",
      name: `${otherAccountNumber}-taxId`,
      normalize: value => value.replace(/[^0-9]/gi, ''),
      initialValue: taxId
    }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
      autoComplete: "off",
      minLength: 4,
      maxLength: 4,
      onChange: e => handleField(e.target.value, 'taxId', otherAccountNumber),
      type: "password",
      className: "fs-exclude"
    }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 6
    }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
      label: "Zip Code",
      name: `${otherAccountNumber}-zipcode`,
      validateTrigger: "onBlur",
      rules: [{
        required: true,
        message: 'Please enter valid zip code'
      }],
      initialValue: zipcode
    }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
      minLength: 5,
      maxLength: 5,
      autoComplete: "off",
      onChange: e => handleField(e.target.value, 'zipcode', otherAccountNumber)
    })))));
  };
  const renderFormFields = () => {
    if (_componentCache.cache.get('portEdit')) {
      return getPortEditFields();
    } else {
      return internalOrderTrackingStatusInfo?.lines?.map((_ref17, index) => {
        let {
          customerTelephoneNumber,
          lineStepStatus,
          lineStep,
          lineActions
        } = _ref17;
        const updateSim = lineActions?.updateSim;
        const updateImei = lineActions?.updateImei;
        const allowPortInfo = lineStep === 'PORTIN' && lineStepStatus === 'RESOLUTIONREQ';
        if (updateSim || updateImei || allowPortInfo) {
          return getOrderFormFields(customerTelephoneNumber, updateSim, updateImei, allowPortInfo, index);
        }
      });
    }
  };
  const [, forceUpdate] = (0, _react.useState)({}); // To disable submit button at the beginning.

  (0, _react.useEffect)(() => {
    forceUpdate({});
  }, []);
  const renderFormSubmitButton = () => {
    if (_componentCache.cache.get('portEdit')) {
      return /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
        shouldUpdate: true
      }, () => /*#__PURE__*/_react.default.createElement(_antd.Button, {
        block: true,
        type: "primary",
        htmlType: "submit",
        loading: loading,
        disabled: disableSimImei && !allowLinesPortInInfo || (0, _helpers.hasErrors)(form.getFieldsError())
      }, "Submit"));
    } else {
      return /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
        shouldUpdate: true
      }, () => /*#__PURE__*/_react.default.createElement(_antd.Button, {
        block: true,
        type: "primary",
        htmlType: "submit",
        loading: loading,
        disabled: disableSimImei && !allowLinesPortInInfo || (0, _helpers.hasErrors)(form.getFieldsError())
      }, "Submit"));
    }
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "view-container"
  }, showConfirmation ? /*#__PURE__*/_react.default.createElement("div", {
    style: {
      height: '100%'
    },
    className: "d-flex justify-content-center align-items-center"
  }, /*#__PURE__*/_react.default.createElement(_StatusFeedback.default, {
    status: "success",
    msg: "Order was updated successfully."
  })) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "alert-container"
  }, errorMsg && /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: errorMsg,
    type: "error",
    showIcon: true
  })), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      border: '1px solid rgba(0, 0, 0, 0.1)',
      padding: '26px 20px'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 6
  }, renderFields()), /*#__PURE__*/_react.default.createElement(_antd.Form, {
    form: form,
    layout: "vertical",
    name: "basic",
    onFinish: onFinish,
    onFinishFailed: onFinishFailed,
    className: "addALineForm"
  }, renderFormFields(), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    gutter: 18
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 5,
    offset: 19
  }, renderFormSubmitButton()))))));
}
var _default = UpdateOrder;
exports.default = _default;
module.exports = exports.default;