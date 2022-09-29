import React, { useState, createContext } from 'react';

const [user, setUser] = useState(null);

const userContext = createContext({user, setUser});

export {userContext};