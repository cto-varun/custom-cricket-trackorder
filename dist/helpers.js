"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasErrors = exports.hasBlanks = exports.Tags = exports.Actions = void 0;
const Actions = {
  UPDATE: 'UPDATE',
  CANCEL: 'CANCEL',
  SUBMIT: 'SUBMIT'
};
exports.Actions = Actions;
const Tags = {
  CREATED: {
    color: 'blue',
    title: 'Created'
  },
  INPROGRESS: {
    color: 'orange',
    title: 'In Progress'
  },
  PAYMENTPENDING: {
    color: 'orange',
    title: 'Payment Pending'
  },
  SUCCESS: {
    color: 'green',
    title: 'Success'
  },
  CANCELLED: {
    color: 'red',
    title: 'Canceled'
  },
  OKTOSUBMIT: {
    color: 'green',
    title: 'OK to Submit'
  },
  FAILURE: {
    color: 'red',
    title: 'Failure'
  }
};
exports.Tags = Tags;
const hasBlanks = fieldObj => {
  return Object.keys(fieldObj).some(field => !fieldObj[field]);
};
exports.hasBlanks = hasBlanks;
const hasErrors = errorObj => {
  return errorObj.some(field => field.errors.length > 0);
};
exports.hasErrors = hasErrors;