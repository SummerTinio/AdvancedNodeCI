// BlogNew shows BlogForm and BlogFormReview
import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import BlogForm from './BlogForm';
import BlogFormReview from './BlogFormReview';

class BlogNew extends Component {
  constructor(props) {
    super(props);
    this.state = { showFormReview: false, file: null }
  }

  onFileChange = (event) => {
    this.setState({ file: event.target.files[0] });
  }

  renderContent() {
    if (this.state.showFormReview) {
      return (
        <BlogFormReview
          onCancel={() => this.setState({ showFormReview: false })}
          file={this.state.file}
        />
      );
    }

    return (
      <BlogForm
        onBlogSubmit={() => this.setState({ showFormReview: true })}
      />
    );
  }

  render() {
    return (
      <div>
        {/*{allows user to click button for File Upload}*/}
        <h5>Add an Image</h5>
        <input onChange={this.onFileChange}type="file" accept="image/*" />
        {this.renderContent()}
      </div>
    );
  }
}

export default reduxForm({
  form: 'blogForm'
})(BlogNew);
