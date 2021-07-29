import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core';

export const apolloClient = new ApolloClient({
  link: createHttpLink({
    uri: 'http://localhost:8090/api/graphql'
  }),
  cache: new InMemoryCache()
})
