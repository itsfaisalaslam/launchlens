import { createContext, useContext } from 'react'

const AppContext = createContext({
  appName: 'Startup Validator',
  tagline: 'Validate your startup ideas with AI-powered insights',
})

export function AppProvider({ children }) {
  return (
    <AppContext.Provider
      value={{
        appName: 'Startup Validator',
        tagline: 'Validate your startup ideas with AI-powered insights',
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}
