import React from 'react';
import { Steps } from 'antd';

const Close = (
    <svg
        width="10"
        height="12"
        viewBox="0 0 10 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M5.80926 6L9.91082 1.11094C9.97957 1.02969 9.92175 0.90625 9.81551 0.90625H8.56863C8.49519 0.90625 8.42488 0.939062 8.37644 0.995312L4.99363 5.02813L1.61082 0.995312C1.56394 0.939062 1.49363 0.90625 1.41863 0.90625H0.171756C0.0655061 0.90625 0.00769352 1.02969 0.0764435 1.11094L4.17801 6L0.0764435 10.8891C0.0610429 10.9072 0.0511628 10.9293 0.0479759 10.9529C0.0447889 10.9764 0.048429 11.0004 0.0584644 11.022C0.0684997 11.0435 0.0845088 11.0617 0.10459 11.0745C0.124672 11.0872 0.147983 11.0939 0.171756 11.0938H1.41863C1.49207 11.0938 1.56238 11.0609 1.61082 11.0047L4.99363 6.97188L8.37644 11.0047C8.42332 11.0609 8.49363 11.0938 8.56863 11.0938H9.81551C9.92175 11.0938 9.97957 10.9703 9.91082 10.8891L5.80926 6Z"
            fill="#D35D43"
        />
    </svg>
);

const capitalizeFirstLetter = (str) => {
    const s = str.toLowerCase();
    const [first, ...rest] = s;
    return [first.toUpperCase(), ...rest].join('');
};

function Stepper({ action, needsAuth, onClose }) {
    const titles = [
        'Account Authentication',
        ...[`${capitalizeFirstLetter(action)} Order`],
    ];

    return (
        <div className="crp__content-steps">
            <span className="crp__content-steps-header">{titles[1]}</span>
            <Steps
                className="crp__content-steps-steps"
                current={needsAuth ? 0 : 1}
            >
                {titles.map((title, index) => (
                    <Steps.Step key={index} title={title} />
                ))}
            </Steps>
            <span className="crp__content-steps-close">
                <span
                    className="crp__content-steps-close-icon"
                    onClick={onClose}
                >
                    {Close}
                </span>
            </span>
        </div>
    );
}

export default Stepper;
