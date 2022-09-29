const axios = require('axios');

//auth/password/reset/ (POST)
//auth/password/reset/confirm/ (POST)
//auth/password/change/ (POST)
//auth/user/ (GET, PUT, PATCH)
//auth/token/verify/ (POST)
//auth/token/refresh/ (POST) 

async function api_call ( args ) {
    let method = args.method;
    let url = args.url;
    let params = args.params;
    let data = null;
    
    if ( localStorage.getItem( 'user' ) || sessionStorage.getItem( 'user' ) ) {
        api.post('/auth/token/refresh/').then(
            response => console.log( response  )
        )
    }
    if (method == 'get'){
        data = api.get(
            url,
            {params: params}
        ).then( 
            response => {
                return response
            }
        ).catch( error => {
            console.log(error)
        })
    } else if ( method == 'post' ) {
        let data = await api.post( 
            url, 
            params 
        ).then( response => {
            return response
        }).catch(
            error => { 
                console.log( error );
            }
        )
        return data;
    }
};

const api = axios.create({
        withCredentials: true,
        baseURL: 'http://localhost:8000/',
        timeout: 5000,
        headers: {
            'Content-Type': 'application/json',
        }
    })

export { api_call, api }




