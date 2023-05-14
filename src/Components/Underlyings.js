import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Http } from "../Shared/Service/HttpHandler";

const Underlyings = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const underlyings = useSelector((state) => state.underlyings.underlyingList);
    const [underlyingList, setUnderlyingList] = useState();

    const webSocket = new WebSocket('wss://prototype.sbulltech.com/api/ws');

    webSocket.onopen = (ev) => {
        console.log(ev);
        console.log('connection opened');
    }

    webSocket.onmessage = (quote) => {
        if (quote.data.data_type === 'quote') {
            const underlyingQuote = quote.data;
            const index = underlyingList.findIndex(elem => elem.token === underlyingQuote.token);
            underlyingList[index].price = underlyingQuote.price;
            setUnderlyingList(underlyingList);
        }
    }

    webSocket.onerror = (error) => {
        console.log(error);
    }
        
    const fetchQuotesInInterval = (payload) => {
        const promises = [];
        payload.forEach((elem) => {
            promises.push(fetchQuote(elem.token));
        });

        Promise.all(promises)
            .then((response) => {
                response.forEach((elem) => {
                    payload.find(underlyingElem => underlyingElem.token === elem.payload.token).price = elem.payload.price.toFixed(2);
                });
                setUnderlyingList(payload);
            })
    }
    
    const fetchQuote = (token) => {
        return Http.get('quotes/' + token);            
    }
    
    useEffect(() => {
        const abortController = new AbortController();
        let tokens = [];
        let promises = [];
        let underlyingInterval;
        const fetchUnderlyings = () => {
            tokens = [];
            if (underlyings.length) {
                setUnderlyingList(underlyings);
            } else {
                Http.get('underlyings')
                    .then((underlyingRes) => {
                        let underlyingsData = underlyingRes.payload;
                        underlyingsData = underlyingsData.map((elem) => {
                            tokens.push(elem.token);
                            promises.push(fetchQuote(elem.token));
                            return elem;
                        });
                        
                        Promise.all(promises)
                            .then((response) => {
                                console.log(response);
                                response.forEach((elem) => {
                                    underlyingsData.find(underlyingElem => underlyingElem.token === elem.payload.token).price = elem.payload.price.toFixed(2);
                                });
                                setUnderlyingList(underlyingsData);
                                underlyingInterval = setInterval(() => { fetchQuotesInInterval(underlyingsData) }, 600000);
                        })
                        webSocket.send({
                            "msg_command":"subscribe",
                            "data_type":"quote",
                            "tokens": tokens
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        }

        fetchUnderlyings();

        return () => {
            clearInterval(underlyingInterval);
            abortController.abort();
            if (webSocket.readyState !== 0) {
                webSocket.send({
                    "msg_command":"unsubscribe",
                    "data_type":"quote",
                    "tokens":[tokens]
                });

                webSocket.onclose = () => {
                    console.log('Websocket Connection Closed');
                };
            }
        }
    }, []);

    const showDerivativeHandler = (payload) => {
        navigate(`/derivatives/${payload.token}`);
    }

    return <>
        <h3>Underlyings Page</h3>
        <ul>
            { underlyingList && 
                underlyingList.map((item) => 
                    <li key={item.token}>
                        <span>
                            {item.underlying}
                            : {item.price}
                        </span>
                        <button onClick={showDerivativeHandler.bind(null, item)}>Show Derivatives</button>
                    </li>
            )}
        </ul>
    </>
}

export default Underlyings;