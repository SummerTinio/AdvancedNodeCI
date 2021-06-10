import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchBlog } from '../../actions';

class BlogShow extends Component {
  constructor(props) {
    super(props);
    this.renderImage = this.renderImage.bind(this);
  }
  componentDidMount() {
    this.props.fetchBlog(this.props.match.params._id);
  }

  renderImage() {
    //note: this.props.blog.imageUrl refers to the fileName!
    if (this.props.blog.fileName) {
      const domain = 'https://evergreen-s3-blog-image-store.s3.ap-northeast-1.amazonaws.com/';
      return <img src={`${domain}${this.props.blog.fileName}`} alt={this.props.blog.title}/>
    }
  }
  
  render() {
    if (!this.props.blog) {
      return '';
    }

    const { title, content } = this.props.blog;

    return ( 
      <div>
        <h3>{title}</h3>
        <p>{content}</p>
        {this.renderImage()}
      </div>
    );
  }
}

function mapStateToProps({ blogs }, ownProps) {
  return { blog: blogs[ownProps.match.params._id] };
}

export default connect(mapStateToProps, { fetchBlog })(BlogShow);
