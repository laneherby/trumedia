import { useState, useEffect } from 'react';
import axios from 'axios';

const useAxiosFetch = (dataUrl) => {
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [tempToken, setTempToken] = useState(null);
    const [tokenExpire, setTokenExpire] = useState(null);
    const [tokenFetched, setTokenFetched] = useState(false);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchTempToken = async () => {
        const tokenRes = await axios.get("https://project.trumedianetworks.com/api/token", { headers: { "apiKey": API_KEY }});
        return tokenRes;
    };

    useEffect(() => {
        const getNewTempToken = async () => {
            const resTempToken = await fetchTempToken();
            setTempToken(resTempToken.data.token);
            setTokenExpire(new Date(resTempToken.data.expires));            
        };   
        getNewTempToken();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if(tempToken) setTokenFetched(true);
    }, [tempToken]);

    useEffect(() => {
        if(dataUrl && tempToken) {
            setIsLoading(true);

            const fetchData = async (url) => {
                try {
                    if(tokenExpire < new Date()) {
                        const tokenRes = await fetchTempToken();
                        setTempToken(tokenRes.data.token);
                        setTokenExpire(new Date(tokenRes.data.expires));
                    }
                    const response = await axios.get(url, { headers: { "tempToken": tempToken }});
                    setData(response.data);
                    setError(null)
                }
                catch (e) {
                    setError(e);
                    setData([]);
                }
                finally {
                    setIsLoading(false);
                }
            }
            console.log(dataUrl);
            fetchData(dataUrl);
        }
        // eslint-disable-next-line
    }, [dataUrl]);

    return { data, error, isLoading, tokenFetched };
};

export default useAxiosFetch;