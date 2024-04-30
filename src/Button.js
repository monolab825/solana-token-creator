import React from 'react';

const Button = ({ handleClick, buttonText }) => {
  return (
    <button onClick={handleClick}>{buttonText}</button>
  );
};

export default Button;
