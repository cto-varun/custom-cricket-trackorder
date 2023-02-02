const Actions = {
    UPDATE: 'UPDATE',
    CANCEL: 'CANCEL',
    SUBMIT: 'SUBMIT',
};

const Tags = {
    CREATED: { color: 'blue', title: 'Created' },
    INPROGRESS: { color: 'orange', title: 'In Progress' },
    PAYMENTPENDING: { color: 'orange', title: 'Payment Pending' },
    SUCCESS: { color: 'green', title: 'Success' },
    CANCELLED: { color: 'red', title: 'Canceled' },
    OKTOSUBMIT: { color: 'green', title: 'OK to Submit' },
    FAILURE: { color: 'red', title: 'Failure' },
};

const hasBlanks = (fieldObj) => {
    return Object.keys(fieldObj).some((field) => !fieldObj[field]);
};

const hasErrors = (errorObj) => {
    return errorObj.some((field) => field.errors.length > 0);
};

export { hasBlanks, hasErrors, Actions, Tags };
