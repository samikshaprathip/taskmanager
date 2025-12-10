import React, { createContext, useContext, useState, useMemo } from 'react'

const SearchContext = createContext(null)

export function SearchProvider({ children }){
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ status: 'all', priority: 'any' })

  const value = useMemo(()=>({ query, setQuery, filters, setFilters }), [query, filters])
  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  )
}

export const useSearch = () => useContext(SearchContext)
