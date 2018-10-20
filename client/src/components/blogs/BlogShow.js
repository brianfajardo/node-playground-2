import React, { Component } from 'react'
import { connect } from 'react-redux'
import { fetchBlog } from '../../actions'

class BlogShow extends Component {
  componentDidMount() {
    this.props.fetchBlog(this.props.match.params._id)
  }

  renderImage() {
    const { imageUrl } = this.props.blog

    if (imageUrl) {
      const s3BucketUrl = `https://s3.us-east-2.amazonaws.com/bf-node-image-upload/${imageUrl}`

      return <img src={s3BucketUrl} />
    }
  }

  render() {
    if (!this.props.blog) {
      return ''
    }

    const { title, content } = this.props.blog

    return (
      <div>
        <h3>{title}</h3>
        {this.renderImage()}
        <p>{content}</p>
      </div>
    )
  }
}

function mapStateToProps({ blogs }, ownProps) {
  return { blog: blogs[ownProps.match.params._id] }
}

export default connect(
  mapStateToProps,
  { fetchBlog }
)(BlogShow)
