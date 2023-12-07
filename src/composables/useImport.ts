import { ref } from "vue";


const queryName = ref<string>();
export const useImport = () => {
    const setQueryName = (query: string) => {
        queryName.value = query;
    };

    const getQueries = async () => {
        return await import(`/src/generated-types/queries.ts`)
    }

    const loadDocument = async () => {
        try {
            const queries = await getQueries();
            return queries[`${queryName.value}Document`];
        } catch (e) {}
    }
    const loadQuery = async () => {
        try {
            const queries = await getQueries();
            return queries[`${queryName.value}Query`];
        } catch (e) {}
    }
    const loadQueryVariables = async () => {
        try {
            const queries = await getQueries();
            return queries[`${queryName.value}QueryVariables`];
        } catch (e) {}
    }

    return {
        setQueryName,
        loadDocument,
        loadQuery,
        loadQueryVariables,
    };
}
