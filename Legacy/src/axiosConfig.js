import axios from 'axios';

// Set default Axios configuration
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'https://legacy-server-api.vercel.app'; // Update to your new backend URL

export default axios;