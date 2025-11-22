import React from 'react';
import './Button.css';
import PropTypes from 'prop-types';

const Button = ({ text, styleType, onClick, disabled, icon, type = 'button' }) => {
  return (
    <button
      className={`button ${styleType || ''}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {icon && <span className="button-icon">{icon}</span>}
      <span className="button-text">{text}</span>
    </button>
  );
};

Button.propTypes = {
  text: PropTypes.string.isRequired,
  styleType: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;
