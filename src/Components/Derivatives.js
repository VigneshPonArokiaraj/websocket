import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";

import { Http } from "../Shared/Service/HttpHandler";
import { derivativeAction } from "../State";

const Derivatives = () => {
    const dispatch = useDispatch();
    const params = useParams();
    const [derivativeList, setDerivativeList] = useState();

    const webSocket = new WebSocket('wss://prototype.sbulltech.com/api/ws');

    webSocket.onopen = (ev) => {
        console.log(ev);
        console.log('connection opened');
    }

    webSocket.onmessage = (quote) => {
        if (quote.data.data_type === 'quote') {
            const derivative = quote.data;
            const index = derivativeList.findIndex(elem => elem.token === derivative.token);
            derivativeList[index].price = derivative.price;
            setDerivativeList(derivativeList);
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
                    payload.find(derivativeElem => derivativeElem.token === elem.payload.token).price = elem.payload.price.toFixed(2);
                });
                setDerivativeList(payload);
            })
    }

    const fetchQuote = (token) => {
        return Http.get('quotes/' + token);            
    }    

    useEffect(() => {
        const abortController = new AbortController();
        let tokens = [];
        let promises = [];
        let derivativeInterval ;
        const fetchDerivatives = () => {
            tokens = [];
            promises = []
            Http.get('derivatives/' + params.token)
                .then((res) => {
                    const derivatives = res.payload.map((derivative) => {
                        tokens.push(derivative.token);
                        promises.push(fetchQuote(derivative.token));
                        return derivative;
                    })
                    Promise.all(promises)
                    .then((response) => {
                        response.forEach((elem) => {
                            derivatives.find(derivativeElem => derivativeElem.token === elem.payload.token).price = elem.payload.price.toFixed(2);
                        });
                        dispatch(derivativeAction.setDerivativeList(derivatives));
                        setDerivativeList(derivatives);
                        derivativeInterval = setInterval(() => { fetchQuotesInInterval(derivatives) }, 30000);
                    })
                    webSocket.send({
                        "msg_command":"subscribe",
                        "data_type":"quote",
                        "tokens": tokens
                    });
                })
                .catch(err => {
                    console.log(err);
                });
        }

        fetchDerivatives();


        return () => {
            clearInterval(derivativeInterval);
            abortController.abort();
            if (webSocket.readyState !== 0) {
                webSocket.send({
                    "msg_command": "unsubscribe",
                    "data_type": "quote",
                    "tokens": [tokens]
                });
    
                webSocket.onclose = () => {
                    // console.log('Websocket Connection Closed');
                };
            }
            
        }
    }, [])

    return <>
        <h3>Derivatives Page</h3>
        <Link to="/underlying">Back</Link>
        <ul>
            {derivativeList && 
                derivativeList.map((item) => 
                <li key={item.token}>
                    {item.symbol}
                    : {item.price}
                </li>
            )}
        </ul>
    </>
}

export default Derivatives;