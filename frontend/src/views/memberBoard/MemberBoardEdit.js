/* eslint-disable */
import React,{ useEffect, useState, useRef } from "react";

import { useHistory } from 'react-router-dom';
import axios from 'axios';

import 'prismjs/themes/prism.css';
import 'assets/css/popover.css';

import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import Moment from 'react-moment';

import 'tui-color-picker/dist/tui-color-picker.css';
import '@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import Authentication from 'views/authentication/AuthenticationService.js';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faPencilAlt, faWrench } from "@fortawesome/free-solid-svg-icons";

// reactstrap components
import {
  Container,
  Input,
  Button,
  FormGroup,
  Row,
  Col,
  PopoverBody,
  PopoverHeader,
  UncontrolledPopover,
} from "reactstrap";

// core components
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import DemoFooter from "components/Footers/DemoFooter.js";
import { Viewer } from '@toast-ui/react-editor';

function MemberBoardEdit(prop) {

  const [boardDtl, setBoardDtl] = useState({boardNo: '', boardTtl:'', boardCntn:'', regMemId:'', crtDt:''});
  const [boardTitle, setBoardTitle] = useState('');
  const [isRegUsr, setIsRegUsr] = useState(true);
  const [replyList, setReplyList] = useState([]);
  const [replyCntn, setReplyCntn] = useState('');
  const [replyNo, setReplyNo] = useState(null);
  const [alrmReplyCntn, setAlrmReplyCntn] = useState('');
  const [modReplyNo, setModReplyNo] = useState('');
  const [modReplyCntn, setModReplyCntn] = useState('');

  const [logindUser, setLoginUser] = useState(Authentication.getLoggedInUserName());

  const history = useHistory();
  const editorRef = useRef();
  const popRef = useRef();

  const api = axios.create({
    baseURL: "/board/member"
  });

  useEffect(() => {
    if(prop.match.params.boardNo != "new" ){
      getBoardDtl();
    }
  }, []);


  // axios function
  function getBoardDtl(){
    getBoardAxios(api);
    getReplyAxios(api);
  }

  function getBoardAxios(api){
    api.get('/getDetail', { params : {boardNo : prop.match.params.boardNo} }
            ).then(function(response){
              
              if(response.data.regMemId != Authentication.getLoggedInUserName()){
                console.log(response.data.regMemId);
                setIsRegUsr(false);
              }

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

  function getReplyAxios(api){
    api.get('/getReply', { params : {boardNo : prop.match.params.boardNo} }
            ).then(function(response){
              setReplyList(response.data);
            }).catch(function(error){
              alert(error);
            });
  }

  function saveDtl(){
    if(confirm("저장하시겠습니까?")){
      const boardDtlState = {...boardDtl};
      boardDtlState.boardCntn = editorRef.current.getInstance().getHTML();
      setBoardDtl(boardDtlState);

      const api = axios.create({
        baseURL: "/board/member"
      });

      api.post('/save', null, { params : {
                                      boardNo : boardDtl.boardNo,
                                      boardTtl : boardTitle,
                                      boardCntn : editorRef.current.getInstance().getHTML(),
                                      regMemId : Authentication.getLoggedInUserName()
                                    } }
              ).then(function(response){
                alert("저장이 완료되었습니다.");

                if(response.data != null && response.data != undefined){
                  history.push("/memberBoardList");
                }
              }).catch(function(error){
                alert(error);
                alert("System Error");
              });
    }
  }

  function inputChange(e){
    let boardTtlState = {...boardTitle};
    //console.log(boardDtlState);
    boardTtlState = e.target.value;
    setBoardTitle(boardTtlState);
  }
  



  ///////////////////////////////////////////////////////////////
  ///////////////////// 댓글 함수
  function replyChange(e){
    let replyCntnState = {...replyCntn};
    //console.log(boardDtlState);
    replyCntnState = e.target.value;
    setReplyCntn(replyCntnState);
  }


  function saveReply(){
    if(confirm("댓글을 작성하시겠습니까?")){

      const api = axios.create({
        baseURL: "/board/member"
      });

      api.post('/saveReply', null, { params : {
                                      upReplyNo: replyNo,
                                      boardNo : boardDtl.boardNo,
                                      replyCntn : replyCntn,
                                      regMemId : Authentication.getLoggedInUserName()
                                    } }
              ).then(function(response){
                alert("저장이 완료되었습니다.");

                setReplyCntn('');
                setStateReply(null, null);
                getBoardDtl();
              }).catch(function(error){
                alert(error);
                alert("System Error");
              });
    }else{
      return;
    }
  }


  function writeReply(targetReplyNo, targetReplyCntn){
    if(popRef.current.state.isOpen == true){
      if(replyNo == targetReplyNo){
        popRef.current.toggle();
        setStateReply(null,null);
      }else{
        setStateReply(targetReplyNo,targetReplyCntn);
      }
    }else{
      setStateReply(targetReplyNo,targetReplyCntn);
      popRef.current.toggle();
    }

  }

  function deleteReply(targetReplyNo){
    if(confirm("댓글을 삭제하시겠습니까?")){

      const api = axios.create({
        baseURL: "/board/member"
      });

      api.post('/deleteReply', null, { params : {
                                      replyNo: targetReplyNo
                                      } 
                                    }
              ).then(function(response){
                console.log(2);
                alert("댓글이 삭제되었습니다.");
                getReplyAxios(api);
              }).catch(function(error){
                alert(error);
                alert("System Error");
              });
    }
  }

  function modifyReply(targetReplyNo, targetReplyCntn){
    console.log("modReplyNo : " + modReplyNo);
    console.log("targetReplyNo : " + targetReplyCntn);
    if(modReplyNo == targetReplyNo){
      setModReplyNo('');
    }else{
      setModReplyCntn(targetReplyCntn);
      setModReplyNo(targetReplyNo);
    }
    
  }

  function cancelReply(){
    popRef.current.toggle();
    setStateReply(null,null);
  }

  function setStateReply(targetReplyNo, targetReplyCntn){
    setReplyNo(targetReplyNo);
    setAlrmReplyCntn(targetReplyCntn);
  }

  function modReplyChange(e){
    let modReplyCntnState = {...modReplyCntn};
    modReplyCntnState = e.target.value;
    setModReplyCntn(modReplyCntnState);
  }

  function saveModReply(targetReply){

    if(confirm("수정하시겠습니까?")){
      console.log(targetReply);
      api.post('/updateReply', null, {params : {
                                        replyNo : targetReply.replyNo,
                                        replyCntn : modReplyCntn
                                        }
                                      }
              ).then(function(response){
                alert("댓글이 수정되었습니다.");
                setModReplyNo('');
                getReplyAxios(api);
              }).catch(function(error){
                alert(error);
                alert("System Error");
              });
    }
  }

  return (
    <>
      <IndexNavbar />
      <ProfilePageHeader />
      
      <div className="section profile-content" >
        <Container className="ml-auto mr-auto" md="9">
          <br/><br/>

          {
            isRegUsr == true ?
            <>
              <Row>
                <Col sm="11" >
                  <FormGroup>
                    <Input autoFocus placeholder="put in title" type="text" size="md" value={boardTitle} onChange={(e)=>{inputChange(e)}}/>
                  </FormGroup>
                </Col>
                <Col sm="1" >
                  <p className="text-right">
                    <Moment format="YYYY.MM.DD">
                      {boardDtl.crtDt}
                    </Moment>
                  </p>
                  <p className="text-right">{boardDtl.regMemId}</p>
                </Col>
              </Row>
              <Editor 
                previewStyle="vertical"
                height="300px"
                initialEditType="wysiwyg"
                plugins={[colorSyntax]}
                ref={editorRef}
              />
              <br/>
              <Button className="btn-round mr-1 float-right"
                      color="default"
                      size="sm"
                      outline
                      type="button"
                      onClick={()=>{saveDtl()}}
              >
                      SAVE
              </Button>
            </>
            :
            <>
              <h3 className="font-weight-bold">{boardTitle}</h3>
              <hr/>
              <Viewer ref={editorRef}/>
            </>
          }
        
          <br/>
          <br/>
          
          <hr/>
          <Row>
            <UncontrolledPopover
              className="popover"
              placement="top"
              target="tooltip344834141"
              trigger="manual"
              ref={popRef}
            >
              <PopoverHeader>{alrmReplyCntn}</PopoverHeader>
              <PopoverBody>
                위 댓글에 대한 대댓글을 작성해주세요
                <br/>
                대댓글을 취소하려면 x 버튼을 클릭해주세요
              </PopoverBody>
              <i className="nc-icon nc-simple-remove" onClick={()=>{cancelReply()}}/>
            </UncontrolledPopover>
          </Row>
          <Row>
            <Col sm="1" className="align-self-center">
              <h6>
                {logindUser}
              </h6>
            </Col>
            <Col sm="10">
                <Input placeholder="댓글을 입력해주세요." type="text" onChange={(e)=>{replyChange(e)}}
                    id="tooltip344834141" />
            </Col>
            <Col sm="1">
                <Button onClick={()=>{saveReply()}}>등록</Button>
            </Col>
          </Row>

          <hr/>

          {
            replyList.map((reply) => {
              return (
                <Row className="mt-3" >
                  {
                    reply.depthLevel > 0 
                    ?<Col sm={reply.depthLevel}></Col>
                    :<div></div>
                  }
                <Col sm="1"  className="align-self-center">
                  <h6>
                    {reply.regMemId}
                  </h6>
                </Col>
                <Col sm={10 - reply.replyDepth}>
                    <p>
                      { /* 댓글 수정.. */
                        reply.replyNo != modReplyNo?
                        reply.replyCntn
                        :
                        <>
                        <Input className="mb-1" value={modReplyCntn} onChange={(e)=>{modReplyChange(e)}}></Input>
                        <label className="label label-default mr-2" onClick={()=>{saveModReply(reply)}}>수정</label>
                        </>
                      }
                      {
                        modReplyNo != reply.replyNo 
                        ?
                          <>
                          {
                            reply.isDel != "Y"
                            ?
                            <>
                            <span style={{cursor: 'pointer'}}
                                  onClick={(e)=>{writeReply(reply.replyNo, reply.replyCntn)}}
                              >
                                    &nbsp;&nbsp; <FontAwesomeIcon icon={faPencilAlt} size="sm" onClick={()=>{writeReply(reply.replyNo)}}/>
                            </span>
                            {
                              logindUser == reply.regMemId 
                              ? 
                              <>
                              {/* 수정 */}
                              <span style={{cursor: 'pointer'}}>
                                &nbsp;&nbsp;<FontAwesomeIcon icon={faWrench} size="sm" onClick={()=>{modifyReply(reply.replyNo, reply.replyCntn)}}/>
                              </span>
                              {/* 삭제 */}
                              <span style={{cursor: 'pointer'}}>
                                &nbsp;&nbsp;<FontAwesomeIcon icon={faTrashAlt} size="sm" onClick={()=>{deleteReply(reply.replyNo)}}/>
                              </span>
                              </>
                              :
                              <div></div>
                            }
                            </>
                            :
                            <div></div>
                          }
                          </>
                        :
                        <span className="align-self-center" style={{cursor: 'pointer'}}>
                          <i className="nc-icon nc-simple-remove" onClick={()=>{modifyReply(reply.replyNo)}}/>
                        </span>
                      }
                    </p>
                </Col>
                <Col sm="1"  className="align-self-center">
                    <Moment format="YYYY.MM.DD">
                      {reply.crtDt}
                    </Moment>
                </Col>
              </Row>
              )
            })
          }

          <br></br>
        </Container>
      </div>
      <DemoFooter />
    </>
  );
}

export default MemberBoardEdit;
