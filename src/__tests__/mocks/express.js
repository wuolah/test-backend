const mockRequest = ( { params, body, query } ) => {
    return {
        params,
        body,
        query,
    };
};

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue( res );
    res.json = jest.fn().mockReturnValue( res );
    return res;
};

module.exports = {
    mockRequest,
    mockResponse
}