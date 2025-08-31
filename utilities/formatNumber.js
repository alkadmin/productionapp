// const formatNumber = (number) => {
//     return number.toLocaleString('en-US', {
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 4,
//     });
// };
// export default formatNumber

const formatNumber = (number) => {
    const formattedString = number.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
    });
    return parseFloat(formattedString.replace(/,/g, ''));
};



export default formatNumber;
