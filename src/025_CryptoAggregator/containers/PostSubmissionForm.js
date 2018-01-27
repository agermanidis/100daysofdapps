

import React, { Component } from 'react';
import { Field, FieldArray, reduxForm, reset } from 'redux-form';
import styled from 'styled-components';
import { TextInput } from '../../styles';
import FaEdit from 'react-icons/lib/fa/edit';

const required = value => value ? undefined : 'Required'

let PostSubmissionForm = props => {
    const { handleSubmit, dispatch } = props
    return (
      <form onSubmit={() =>  {
        handleSubmit();
        dispatch(reset('new-post'));
      }}>
        <div>
          <label htmlFor="title">Title</label>
          {' '}
          <Field name="title" component='input' type="text" validate={[required]} />
        </div>
        <div>
          <label htmlFor="url">URL</label>
          {' '}
          <Field name="url" component='input' type="url"  validate={[required]} />
      </div>
        <button type="submit"><FaEdit /> Post</button>
      </form>
    )
  };
  
  export default reduxForm({
    form: 'new-post'
  })(PostSubmissionForm);
  