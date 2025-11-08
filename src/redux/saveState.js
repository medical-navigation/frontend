export const saveState = (state) => {
    try {
        const stateToPersist = {
            errorModal: state.errorModal
        };
        const serializedState = JSON.stringify(stateToPersist);
        localStorage.setItem('state', serializedState);
    } catch (e) {
        console.error('Failed to save state', e);
    }
};

export const loadState = () => {
    try {
        const serializedState = localStorage.getItem('state');
        if (!serializedState) {
            return undefined;
        }
        const parsed = JSON.parse(serializedState);
        if (parsed && parsed.user) {
            delete parsed.user;
        }
        return {
            ...parsed
        };
    } catch (e) {
        console.error('Failed to load state', e);
        return undefined;
    }
};
