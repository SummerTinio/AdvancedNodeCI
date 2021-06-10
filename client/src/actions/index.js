import axios from 'axios';
import { FETCH_USER, FETCH_BLOGS, FETCH_BLOG } from './types';

export const fetchUser = () => async dispatch => {
  const res = await axios.get('/api/current_user');

  dispatch({ type: FETCH_USER, payload: res.data });
};

export const handleToken = token => async dispatch => {
  const res = await axios.post('/api/stripe', token);

  dispatch({ type: FETCH_USER, payload: res.data });
};

// note: actual request to AWS API for a presigned url for image upload happens on uploadRoutes.js -- not here.
export const submitBlog = (formValues, history, eventTargetFile) => async dispatch => {
  let completeFileName = null;
  // i.e. "only give the user a presigned url if they actually want to upload a file"
  if (eventTargetFile !== null){
    // object containing: fileName: '', preSignedUrl: ''
    const BackendApiResponse = await axios.get('/api/upload'); // aka uploadConfig
    completeFileName = BackendApiResponse.data.fileName;
    const AwsPreSignedUrl = BackendApiResponse.data.preSignedUrl; // JSON data === accessible from .data property
    // BCK, bucket, contentType, key
    // eventTargetFile comes from ReduxForm .. event.target.files[0]
    await axios.put(
      AwsPreSignedUrl, 
      eventTargetFile,
      {
        headers: {
          'content-type': eventTargetFile.type 
        } 
      }
    );
  }

  // issue POST request to backend API to make a blog post
  // options object will be used to set state.
  const res = await axios.post('/api/blogs', {fileName: completeFileName, ...formValues}); 

  // navigate user back to list of blogs
  // must await, or else page redirects too early
  await history.push('/blogs');
  // tell Redux side of app about newly-created blog post
  dispatch({ type: FETCH_BLOG, payload: res.data });
};

export const fetchBlogs = () => async dispatch => {
  const res = await axios.get('/api/blogs');

  dispatch({ type: FETCH_BLOGS, payload: res.data });
};

export const fetchBlog = id => async dispatch => {
  const res = await axios.get(`/api/blogs/${id}`);

  dispatch({ type: FETCH_BLOG, payload: res.data });
};