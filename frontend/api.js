const reacturl = 'https://moneytracker-frontend-d1bcbg69n.vercel.app'

export const Create = (reqbody) => {
    let url = reacturl + '/api/createnew';

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqbody)
    };

    return fetch(url, options)
        .then(res => res.json())
        .catch(err => console.error('error:' + err));
}

export const GetAll = (reqbody) => {
    let url = reacturl + '/api/all';

    let options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    return fetch(url, options)
        .then(res => res.json())
        .catch(err => console.error('error:' + err));
}

export const Update = (id, reqbody) => {
    let url = reacturl + '/api/' + id;

    let options = {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqbody)
    };

    return fetch(url, options)
        .then(res => res.json())
        .catch(err => console.error('error:' + err));
}

export const Delete = (id) => {
    let url = reacturl + '/api/' + id;

    let options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    return fetch(url, options)
        .then(res => res.json())
        .catch(err => console.error('error:' + err));
}