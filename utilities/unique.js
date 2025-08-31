import { v4 as uuidv4 } from 'uuid';
const uniqueCodePallet = (length) => {
    const uuid = uuidv4().replace(/-/g, ''); 
    return uuid.substring(0, length).toUpperCase(); ; 
}
export default uniqueCodePallet