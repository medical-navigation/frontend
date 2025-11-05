export const saveState = (state) => {
    try{
        const serializedState = JSON.stringify(state);
        localStorage.setItem('state', serializedState);
    } catch(e){
        console.error("Невозможно сохранить состояние", e);
    }
}

export const loadState = () => {
    try{
        const serializedState = localStorage.getItem('state');
        if(!serializedState){
            return undefined;
        }
        return JSON.parse(serializedState);
    }catch(e){
        console.error("Невозможно загрузить состояние", e);
        return undefined;
    }
}