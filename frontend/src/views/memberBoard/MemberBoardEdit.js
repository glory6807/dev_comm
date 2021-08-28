/* eslint-disable */
import React,{ useEffect, useState, useRef } from "react";

import { useHistory } from 'react-router-dom';
import axios from 'axios';

import 'prismjs/themes/prism.css';

import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';

import 'tui-color-picker/dist/tui-color-picker.css';
import '@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';

// reactstrap components
import {
  Container,
  Input,
  Button,
  FormGroup
} from "reactstrap";

// core components
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import DemoFooter from "components/Footers/DemoFooter.js";
import { Viewer } from '@toast-ui/react-editor';

function MemberBoardEdit(prop) {

  const [boardDtl, setBoardDtl] = useState({boardNo: '', boardTtl:'', boardCntn:''});
  const [boardTitle, setBoardTitle] = useState('');

  const history = useHistory();
  const editorRef = useRef();

  useEffect(() => {
    if(prop.match.params.boardNo != "new" ){
      getBoardDtl();
    }
  }, []);


  // axios function
  function getBoardDtl(){

    async()=>{

    }
    const api = axios.create({
      baseURL: "/board/member"
    });
    api.get('/getDetail', { params : {boardNo : prop.match.params.boardNo} }
            ).then(function(response){
              let boardDtlState = {...boardDtl};
              boardDtlState = response.data;
              setBoardDtl(boardDtlState);
              setBoardTitle(boardDtlState.boardTtl);
              if(editorRef.current.getInstance().isViewer()){
                editorRef.current.getInstance().setMarkdown(response.data.boardCntn);
              }
              else{
                editorRef.current.getInstance().setHTML(response.data.boardCntn);
              }
              
            }).catch(function(error){
              alert(error);
            });
  }

  function saveDtl(){
    const boardDtlState = {...boardDtl};
    boardDtlState.boardCntn = editorRef.current.getInstance().getHTML();
    setBoardDtl(boardDtlState);

    const api = axios.create({
      baseURL: "/board/member"
    });

    api.post('/save', null, { params : {
                                    boardNo : boardDtl.boardNo,
                                    boardTtl : boardTitle,
                                    boardCntn : editorRef.current.getInstance().getHTML()
                                  } }
            ).then(function(response){
              alert("저장이 완료되었습니다.");
              console.log(response.data)
              if(response.data != null && response.data != undefined){
                history.push("/memberBoardEdit/" + response.data);
              }
            }).catch(function(error){
              alert(error);
              alert("System Error");
            });
  }

  function inputChange(e){
    let boardTtlState = {...boardTitle};
    //console.log(boardDtlState);
    boardTtlState = e.target.value;
    setBoardTitle(boardTtlState);
  }

  return (
    <>
      <IndexNavbar />
      <ProfilePageHeader />
      
      <div className="section profile-content" >
        <Container className="ml-auto mr-auto" md="9">
          <h3 className="font-weight-bold">Member Board Edit</h3>
          <br/>
          {/* Title */}
          <FormGroup>
            <Input autoFocus placeholder="put in title" type="text" size="sm" value={boardTitle} onChange={(e)=>{inputChange(e)}}/>
          </FormGroup>



          {/* Content 
          <Viewer ref={editorRef}/>
          */}
          <Editor 
              previewStyle="vertical"
              height="300px"
              initialEditType="wysiwyg"
              plugins={[colorSyntax]}
              ref={editorRef}
          />
        
          <br/>

          {/* Save Button */}
          <Button className="btn-round mr-1 float-right"
                  color="default"
                  size="sm"
                  outline
                  type="button"
                  onClick={()=>{saveDtl()}}
          >
                  SAVE
          </Button>

          
          <br></br>
        </Container>
      </div>
      <DemoFooter />
    </>
  );
}

export default MemberBoardEdit;
