import React from "react";


const LinkageRulesContext = React.createContext({});

export const useLinkageRules = () => React.useContext(LinkageRulesContext);


export const LinkageRulesProvider = LinkageRulesContext.Provider
