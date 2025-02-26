import React from 'react';

// Mock Link component from react-router-dom
const Link = ({ to, children, ...rest }) => (
  <a href={to} {...rest}>{children}</a>
);

export { Link };
