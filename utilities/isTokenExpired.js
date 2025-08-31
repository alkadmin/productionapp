import jwtDecode from 'jwt-decode';

function isTokenExpired(token) {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // tiempo actual en segundos
    return decodedToken.exp < currentTime;
}
