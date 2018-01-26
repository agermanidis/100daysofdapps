import styled from 'styled-components';
import Textarea from "react-expanding-textarea";

const TextInput = styled.input`
    padding: 1em;
    font-size: 1em;
    outline: none;
    margin: 1em 0;
`;

const NewPostInputContainer = styled.div`
  font-size: 0.75em;
  margin: 1em auto;
  width: 500px;
  text-align: left;
  border: 1px solid lightgray;
`;

const NewPostInputLayout = styled.div`
  display: flex;
  align-items: center;
`;

const MsgLimitLabel = styled.span`
  margin: 1em;
  color: gray;
`;

const StyledTextarea = styled(Textarea)`
  outline: none;
  font-size: 1.25em;
  border: none;
  width: 100%;
  height: 50px;
  resize: none;
  min-height: 100px;
`;

const HorizontalLayout = styled.div`
  display: flex;
`;

const FillSpace = styled.div`
  flex: 1;
`;

export {
  TextInput,
  NewPostInputContainer,
  NewPostInputLayout,
  MsgLimitLabel,
  StyledTextarea,
  HorizontalLayout,
  FillSpace
};