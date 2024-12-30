/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ icon, title, value, valueClassName, description}) => {
  return (
    <div className="bg-sky-50 p-6 rounded-lg transition-all hover:shadow-md">
      <div className="flex flex-col items-center text-center">
        {icon && <div className="mb-3 text-sky-600">{icon}</div>}
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        <p className={`text-gray text-2xl font-semibold ${valueClassName}`}>{value}</p>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
};

Card.propTypes = {
  icon: PropTypes.element,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  valueClassName: PropTypes.string,
  description: PropTypes.string.isRequired,
};

Card.defaultProps = {
  icon: null,
  valueClassName: '',
};

export default Card;