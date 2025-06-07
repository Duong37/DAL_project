"use strict";(self.webpackChunkjupyterlab_dal_extension=self.webpackChunkjupyterlab_dal_extension||[]).push([[115],{115:(e,t,n)=>{n.r(t),n.d(t,{default:()=>Pt});var a=n(977),l=n(405),r=n(893),i=n.n(r),o=n(563),c=n.n(o);const s=c().div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`,d=c().h3`
  margin: 0;
  color: #333;
`,m=c().div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
  min-height: 100px;
`,u=c().div`
  text-align: center;
  color: #666;
  padding: 32px;
`,p=({sample:e})=>e?i().createElement(s,null,i().createElement(d,null,"Sample #",e.id),i().createElement(m,null,(()=>{var t,n;if(e.data&&e.features)return i().createElement("div",null,i().createElement("div",{style:{marginBottom:"16px"}},i().createElement("div",{style:{fontWeight:"bold",marginBottom:"8px",color:"#2196F3"}},"Wine Sample Analysis"),i().createElement("div",{style:{fontSize:"12px",color:"#666",marginBottom:"12px"}},"Chemical analysis showing ",Object.keys(e.features).length," features")),i().createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:"8px",marginBottom:"16px"}},Object.entries(e.features).map((([e,t])=>i().createElement("div",{key:e,style:{padding:"8px",backgroundColor:"#f8f9fa",borderRadius:"4px"}},i().createElement("div",{style:{fontSize:"11px",color:"#666",textTransform:"capitalize"}},e.replace(/_/g," ")),i().createElement("div",{style:{fontWeight:"bold",fontSize:"14px"}},"number"==typeof t?t.toFixed(3):t))))),e.metadata&&i().createElement("div",{style:{marginTop:"16px",padding:"12px",backgroundColor:"#e3f2fd",borderRadius:"4px"}},i().createElement("div",{style:{fontWeight:"bold",marginBottom:"8px",color:"#1976d2"}},"Model Prediction"),i().createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}},i().createElement("div",null,i().createElement("span",{style:{color:"#666"}},"Predicted: "),i().createElement("span",{style:{fontWeight:"bold"}},e.metadata.predicted_class)),i().createElement("div",null,i().createElement("span",{style:{color:"#666"}},"Confidence: "),i().createElement("span",{style:{fontWeight:"bold"}},(100*e.metadata.prediction_confidence).toFixed(1),"%"))),e.metadata&&e.metadata.class_probabilities&&i().createElement("div",{style:{marginTop:"8px"}},i().createElement("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"}},"Class Probabilities:"),i().createElement("div",{style:{display:"flex",gap:"8px",fontSize:"11px"}},Object.entries(e.metadata.class_probabilities).map((([t,n])=>i().createElement("div",{key:t,style:{padding:"2px 6px",backgroundColor:"#f8f9fa",borderRadius:"3px",border:t===`class_${e.metadata.predicted_class.split("_")[1]}`?"2px solid #1976d2":"1px solid #dee2e6"}},t.replace("class_","C"),": ",(100*Number(n)).toFixed(1),"%")))))),e.uncertainty&&i().createElement("div",{style:{marginTop:"12px",padding:"12px",backgroundColor:"#fff3e0",borderRadius:"4px"}},i().createElement("div",{style:{fontWeight:"bold",marginBottom:"4px",color:"#f57c00"}},"Uncertainty Score: ",e.uncertainty.toFixed(3)),i().createElement("div",{style:{fontSize:"12px",color:"#666"}},"Higher uncertainty = more valuable for model improvement"),(null===(t=e.metadata)||void 0===t?void 0:t.query_strategy)&&i().createElement("div",{style:{marginTop:"8px",fontSize:"11px",color:"#555"}},i().createElement("strong",null,"Strategy:")," ",e.metadata.query_strategy.name," (",e.metadata.query_strategy.method,")")),(null===(n=e.metadata)||void 0===n?void 0:n.model_info)&&i().createElement("div",{style:{marginTop:"12px",padding:"12px",backgroundColor:"#e8f5e8",borderRadius:"4px"}},i().createElement("div",{style:{fontWeight:"bold",marginBottom:"4px",color:"#2e7d32"}},"Model Information"),i().createElement("div",{style:{fontSize:"12px",color:"#555"}},i().createElement("div",null,i().createElement("strong",null,"Type:")," ",e.metadata.model_info.type),i().createElement("div",null,i().createElement("strong",null,"Training Samples:")," ",e.metadata.model_info.training_samples))));if(e.data)return i().createElement("div",null,i().createElement("div",{style:{marginBottom:"8px",fontWeight:"bold"}},"Data Array:"),i().createElement("pre",{style:{fontSize:"12px",maxHeight:"200px",overflow:"auto"}},JSON.stringify(e.data,null,2)),e.uncertainty&&i().createElement("div",{style:{marginTop:"8px",color:"#666"}},"Uncertainty: ",e.uncertainty.toFixed(3)));if(!e.content)return i().createElement("div",null,"No content available");switch(e.type){case"text":return i().createElement("div",null,e.content);case"image":return i().createElement("img",{src:e.content,alt:`Sample ${e.id}`,style:{maxWidth:"100%",height:"auto"}});case"data":try{const t=JSON.parse(e.content);return i().createElement("pre",null,JSON.stringify(t,null,2))}catch(t){return i().createElement("pre",null,e.content)}default:return i().createElement("div",null,e.content)}})())):i().createElement(s,null,i().createElement(d,null,"Current Sample"),i().createElement(u,null,"No sample available for labeling at this time.")),g=c().div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`,f=c().h3`
  margin: 0;
  color: #333;
`,E=c().div`
  display: flex;
  gap: 8px;
`,b=c().button`
  padding: 12px 24px;
  border: 2px solid #4CAF50;
  border-radius: 4px;
  background-color: ${e=>e.selected?"#4CAF50":"white"};
  color: ${e=>e.selected?"white":"#4CAF50"};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background-color: ${e=>e.selected?"#45a049":"#f0f8f0"};
  }

  &:disabled {
    border-color: #cccccc;
    background-color: ${e=>e.selected?"#cccccc":"#f5f5f5"};
    color: #666666;
    cursor: not-allowed;
  }
`,h=c().button`
  padding: 12px 24px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 16px;

  &:hover {
    background-color: #1976D2;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`,x=({onVote:e,disabled:t})=>{const[n,a]=(0,r.useState)(null),[l,o]=(0,r.useState)(!1);return i().createElement(g,null,i().createElement(f,null,"Cast Your Vote"),i().createElement(E,null,["Class 0","Class 1","Class 2"].map((e=>i().createElement(b,{key:e,selected:n===e,disabled:t||l,onClick:()=>a(e)},e.charAt(0).toUpperCase()+e.slice(1))))),i().createElement(h,{disabled:!n||t||l,onClick:async()=>{if(n){o(!0);try{const t=(e=>{switch(e){case"Class 0":default:return 0;case"Class 1":return 1;case"Class 2":return 2}})(n);await e(t),a(null)}catch(e){console.error("Error submitting vote:",e)}finally{o(!1)}}}},l?"Submitting...":"Submit Vote"))},y=c().div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`,v=c().h3`
  margin: 0;
  color: #333;
`,w=c().div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`,k=c().div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`,_=c().div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
`,C=c().div`
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  background: ${e=>e.correct?"#d4edda":"#f8d7da"};
  
  &:last-child {
    border-bottom: none;
  }
`,S=c().div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`,z=c().span`
  font-weight: bold;
  color: #495057;
`,F=c().span`
  font-size: 12px;
  color: #6c757d;
`,M=c().div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin-top: 8px;
  font-size: 14px;
`,I=c().div`
  display: flex;
  flex-direction: column;
`,A=c().span`
  font-size: 11px;
  color: #6c757d;
  text-transform: uppercase;
`,P=c().span`
  font-weight: bold;
`,$=c().div`
  text-align: center;
  color: #6c757d;
  padding: 32px;
`,L=({votingHistory:e})=>{if(!e)return i().createElement(y,null,i().createElement(v,null,"Voting History"),i().createElement($,null,"Loading voting history..."));const{votes:t,analytics:n}=e;return 0===t.length?i().createElement(y,null,i().createElement(v,null,"Voting History"),i().createElement($,null,"No votes recorded yet. Start labeling samples to see your history!")):i().createElement(y,null,i().createElement(v,null,"Voting History (",t.length," votes)"),i().createElement(w,null,i().createElement("h4",{style:{margin:"0 0 12px 0",color:"#495057"}},"Analytics Summary"),i().createElement(k,null,i().createElement("span",null,"Human Labeling Accuracy:"),i().createElement("strong",null,n.accuracy_rate.toFixed(1),"%")),i().createElement(k,null,i().createElement("span",null,"Correct Labels:"),i().createElement("strong",null,n.correct_votes," / ",n.total_votes)),i().createElement(k,null,i().createElement("span",null,"Average Uncertainty:"),i().createElement("strong",null,n.average_uncertainty.toFixed(3))),i().createElement(k,null,i().createElement("span",null,"Class Distribution:"),i().createElement("div",{style:{display:"flex",gap:"12px"}},Object.entries(n.class_distribution).map((([e,t])=>i().createElement("span",{key:e},e.replace("class_","C"),": ",t)))))),i().createElement(_,null,t.slice().reverse().map(((e,t)=>i().createElement(C,{key:e.sample_id||t,correct:e.correct},i().createElement(S,null,i().createElement(z,null,e.sample_id),i().createElement(F,null,e.timestamp)),i().createElement(M,null,i().createElement(I,null,i().createElement(A,null,"Your Label"),i().createElement(P,null,"Class ",e.user_label)),i().createElement(I,null,i().createElement(A,null,"True Label"),i().createElement(P,null,"Class ",e.true_label)),i().createElement(I,null,i().createElement(A,null,"Model Predicted"),i().createElement(P,null,e.model_prediction_before)),i().createElement(I,null,i().createElement(A,null,"Confidence"),i().createElement(P,null,(100*e.confidence_before).toFixed(1),"%")),i().createElement(I,null,i().createElement(A,null,"Uncertainty"),i().createElement(P,null,e.uncertainty_score.toFixed(3))),i().createElement(I,null,i().createElement(A,null,"Result"),i().createElement(P,{style:{color:e.correct?"#155724":"#721c24"}},e.correct?"✓ Correct":"✗ Incorrect"))))))))},B=c().div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`,T=c().h3`
  margin: 0;
  color: #333;
`,D=c().div`
  background: #e3f2fd;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #bbdefb;
`,R=c().div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`,j=c().div`
  max-height: 350px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
`,W=c().div`
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`,O=c().div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`,H=c().span`
  font-weight: bold;
  color: #1976d2;
`,V=c().span`
  font-size: 12px;
  color: #6c757d;
`,U=c().div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 8px;
`,N=c().div`
  text-align: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
`,q=c().div`
  font-size: 11px;
  color: #6c757d;
  text-transform: uppercase;
  margin-bottom: 4px;
`,Y=c().div`
  font-weight: bold;
  font-size: 14px;
`,Q=c().span`
  font-size: 12px;
  color: ${e=>e.improvement>0?"#28a745":e.improvement<0?"#dc3545":"#6c757d"};
  margin-left: 8px;
`,G=c().div`
  height: 100px;
  background: #f8f9fa;
  border-radius: 4px;
  padding: 8px;
  position: relative;
  overflow: hidden;
`,J=c().div`
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
  text-align: center;
`,K=c().div`
  display: flex;
  align-items: end;
  height: 60px;
  gap: 2px;
`,X=c().div`
  flex: 1;
  background: ${e=>e.color};
  height: ${e=>e.height}%;
  min-height: 2px;
  border-radius: 2px 2px 0 0;
  position: relative;
  
  &:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    white-space: nowrap;
    z-index: 1000;
  }
`,Z=c().div`
  text-align: center;
  color: #6c757d;
  padding: 32px;
`,ee=({modelUpdates:e})=>{if(!e)return i().createElement(B,null,i().createElement(T,null,"Model Performance History"),i().createElement(Z,null,"Loading model history..."));const{updates:t,performance_trend:n,summary:a}=e;if(0===t.length)return i().createElement(B,null,i().createElement(T,null,"Model Performance History"),i().createElement(Z,null,"No model updates yet. Submit labels to start training!"));const l=Math.max(...n.map((e=>e.accuracy||0))),r=Math.min(...n.map((e=>e.accuracy||0))),o=l-r||.1;return i().createElement(B,null,i().createElement(T,null,"Model Performance History (",t.length," updates)"),i().createElement(D,null,i().createElement("h4",{style:{margin:"0 0 12px 0",color:"#1976d2"}},"Performance Summary"),i().createElement(R,null,i().createElement("span",null,"Total Improvement:"),i().createElement("strong",null,(100*a.total_improvement).toFixed(2),"%",i().createElement(Q,{improvement:a.total_improvement},a.total_improvement>0?"↗":a.total_improvement<0?"↘":"→"))),i().createElement(R,null,i().createElement("span",null,"Initial → Current Accuracy:"),i().createElement("strong",null,(100*a.initial_accuracy).toFixed(1),"% → ",(100*a.current_accuracy).toFixed(1),"%")),i().createElement(R,null,i().createElement("span",null,"Model Updates:"),i().createElement("strong",null,a.total_updates))),n.length>1&&i().createElement(G,null,i().createElement(J,null,"Accuracy Progression"),i().createElement(K,null,n.map(((e,t)=>{const n=o>0?(e.accuracy-r)/o*100:50;return i().createElement(X,{key:t,height:Math.max(n,5),color:0===t?"#dee2e6":"#28a745",title:`Sample ${e.labeled_count}: ${(100*e.accuracy).toFixed(1)}%`})})))),i().createElement(j,null,t.slice().reverse().map(((e,t)=>i().createElement(W,{key:e.update_id||t},i().createElement(O,null,i().createElement(H,null,"Update #",e.update_id),i().createElement(V,null,e.timestamp)),i().createElement("div",{style:{fontSize:"14px",color:"#495057",marginBottom:"8px"}},"Triggered by: ",i().createElement("strong",null,e.trigger_sample)),i().createElement(U,null,i().createElement(N,null,i().createElement(q,null,"Accuracy"),i().createElement(Y,null,(100*e.new_metrics.accuracy).toFixed(1),"%",i().createElement(Q,{improvement:e.performance_improvement.accuracy_change},e.performance_improvement.accuracy_change>0?`+${(100*e.performance_improvement.accuracy_change).toFixed(2)}%`:`${(100*e.performance_improvement.accuracy_change).toFixed(2)}%`))),i().createElement(N,null,i().createElement(q,null,"F1 Score"),i().createElement(Y,null,(100*e.new_metrics.f1_score).toFixed(1),"%",i().createElement(Q,{improvement:e.performance_improvement.f1_change},e.performance_improvement.f1_change>0?`+${(100*e.performance_improvement.f1_change).toFixed(2)}%`:`${(100*e.performance_improvement.f1_change).toFixed(2)}%`))),i().createElement(N,null,i().createElement(q,null,"Precision"),i().createElement(Y,null,(100*e.new_metrics.precision).toFixed(1),"%")),i().createElement(N,null,i().createElement(q,null,"Recall"),i().createElement(Y,null,(100*e.new_metrics.recall).toFixed(1),"%")),i().createElement(N,null,i().createElement(q,null,"Labeled Samples"),i().createElement(Y,null,e.total_labeled))))))))},te=c().div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`,ne=c().h3`
  margin: 0;
  color: #333;
`,ae=c().div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`,le=c().button`
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: ${e=>e.active?"#007bff":"#f8f9fa"};
  color: ${e=>e.active?"white":"#495057"};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: ${e=>e.active?"#0056b3":"#e9ecef"};
  }
`,re=c().div`
  background: #f1f3f4;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #dadce0;
`,ie=c().div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 12px;
`,oe=c().div`
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 4px;
`,ce=c().div`
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 4px;
`,se=c().div`
  font-weight: bold;
  font-size: 18px;
  color: #1a73e8;
`,de=c().div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
`,me=c().div`
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  
  &:last-child {
    border-bottom: none;
  }
`,ue=c().div`
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  word-break: break-all;
  margin: 4px 0;
  border-left: 3px solid #28a745;
`,pe=c().div`
  margin: 4px 0;
`,ge=c().span`
  color: #6c757d;
  font-weight: bold;
`,fe=c().div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 12px;
  margin: 8px 0;
`,Ee=c().div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
`,be=c().div`
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
`,he=c().div`
  background: ${e=>e.color};
  color: white;
  padding: 12px;
  font-weight: bold;
  text-align: center;
`,xe=c().div`
  padding: 12px;
  background: white;
`,ye=c().div`
  text-align: center;
  color: #6c757d;
  padding: 32px;
`,ve=({blockchainData:e})=>{const[t,n]=(0,r.useState)("overview");if(!e)return i().createElement(te,null,i().createElement(ne,null,"Blockchain Simulation"),i().createElement(ye,null,"Loading blockchain simulation..."));const{on_chain:a,off_chain:l,privacy_stats:o}=e;return i().createElement(te,null,i().createElement(ne,null,"Blockchain Simulation"),i().createElement(ae,null,i().createElement(le,{active:"overview"===t,onClick:()=>n("overview")},"Overview"),i().createElement(le,{active:"on-chain"===t,onClick:()=>n("on-chain")},"On-Chain Data"),i().createElement(le,{active:"off-chain"===t,onClick:()=>n("off-chain")},"Off-Chain Data"),i().createElement(le,{active:"comparison"===t,onClick:()=>n("comparison")},"Comparison")),"overview"===t&&i().createElement("div",null,i().createElement(re,null,i().createElement("h4",{style:{margin:"0 0 12px 0",color:"#5f6368"}},"Blockchain Analytics"),i().createElement(ie,null,i().createElement(oe,null,i().createElement(ce,null,"Total Blocks"),i().createElement(se,null,a.total_blocks)),i().createElement(oe,null,i().createElement(ce,null,"Gas Used"),i().createElement(se,null,a.total_gas_used.toLocaleString())),i().createElement(oe,null,i().createElement(ce,null,"On-Chain Storage"),i().createElement(se,null,a.storage_size_kb.toFixed(1)," KB")),i().createElement(oe,null,i().createElement(ce,null,"Off-Chain Storage"),i().createElement(se,null,l.storage_size_kb.toFixed(1)," KB")),i().createElement(oe,null,i().createElement(ce,null,"Features Hidden"),i().createElement(se,null,o.features_hidden_on_chain)),i().createElement(oe,null,i().createElement(ce,null,"Privacy Ratio"),i().createElement(se,null,o.data_reduction_ratio.toFixed(2),"x")))),i().createElement(fe,null,i().createElement("strong",null,"Privacy Benefits:")," Only ",o.only_hashes_on_chain," hashes stored on-chain, keeping ",o.features_hidden_on_chain," sensitive features private. Full audit trail available while maintaining data privacy.")),"on-chain"===t&&i().createElement("div",null,i().createElement("h4",null,"On-Chain Data (Public Blockchain)"),i().createElement("p",{style:{color:"#6c757d",fontSize:"14px"}},"Only hashes and minimal metadata stored on the public blockchain for transparency and immutability."),i().createElement(de,null,[...a.vote_records,...a.model_updates].map(((e,t)=>i().createElement(me,{key:t},i().createElement(pe,null,i().createElement(ge,null,"Block:")," #",e.block_number),i().createElement(pe,null,i().createElement(ge,null,"Timestamp:")," ",e.timestamp),e.vote_hash&&i().createElement(i().Fragment,null,i().createElement(pe,null,i().createElement(ge,null,"Vote Hash:")),i().createElement(ue,null,e.vote_hash),i().createElement(pe,null,i().createElement(ge,null,"Sample ID:")," ",e.sample_id),i().createElement(pe,null,i().createElement(ge,null,"Voter:")," ",e.voter_address)),e.update_hash&&i().createElement(i().Fragment,null,i().createElement(pe,null,i().createElement(ge,null,"Update Hash:")),i().createElement(ue,null,e.update_hash),i().createElement(pe,null,i().createElement(ge,null,"Trigger:")," ",e.trigger_sample),i().createElement(pe,null,i().createElement(ge,null,"Performance:")," Acc: ",(100*e.performance_improvement.accuracy_change).toFixed(2),"%, F1: ",(100*e.performance_improvement.f1_change).toFixed(2),"%")),i().createElement(pe,null,i().createElement(ge,null,"Gas Used:")," ",e.gas_used.toLocaleString())))))),"off-chain"===t&&i().createElement("div",null,i().createElement("h4",null,"Off-Chain Data (Private Storage)"),i().createElement("p",{style:{color:"#6c757d",fontSize:"14px"}},"Full sample data and model information stored privately, linked to on-chain hashes."),i().createElement(de,null,l.vote_data.map(((e,t)=>i().createElement(me,{key:t},i().createElement(pe,null,i().createElement(ge,null,"Hash Reference:")),i().createElement(ue,null,e.hash),i().createElement(pe,null,i().createElement(ge,null,"Sample Features:")," ",Object.keys(e.sample_features).length," features"),i().createElement(pe,null,i().createElement(ge,null,"Feature Sample:"),Object.entries(e.sample_features).slice(0,3).map((([e,t])=>`${e}: ${"number"==typeof t?t.toFixed(3):t}`)).join(", "),"..."),i().createElement(pe,null,i().createElement(ge,null,"Model State:"),"Pred: ",e.model_state.prediction,", Conf: ",(100*e.model_state.confidence).toFixed(1),"%, Unc: ",e.model_state.uncertainty.toFixed(3)),i().createElement(pe,null,i().createElement(ge,null,"Labels:"),"User: ",e.label_data.user_label,", True: ",e.label_data.true_label,", Correct: ",e.label_data.correct?"✓":"✗")))))),"comparison"===t&&i().createElement(Ee,null,i().createElement(be,null,i().createElement(he,{color:"#dc3545"},"On-Chain Limitations"),i().createElement(xe,null,i().createElement("ul",{style:{margin:0,paddingLeft:"20px"}},i().createElement("li",null,"High gas costs for data storage"),i().createElement("li",null,"Public visibility of all data"),i().createElement("li",null,"Immutable but expensive"),i().createElement("li",null,"Limited storage capacity"),i().createElement("li",null,"Privacy concerns for sensitive data")))),i().createElement(be,null,i().createElement(he,{color:"#28a745"},"Hybrid Solution Benefits"),i().createElement(xe,null,i().createElement("ul",{style:{margin:0,paddingLeft:"20px"}},i().createElement("li",null,"Minimal on-chain storage (hashes only)"),i().createElement("li",null,"Private sensitive data storage"),i().createElement("li",null,"Immutable audit trail"),i().createElement("li",null,"Cost-effective solution"),i().createElement("li",null,"Verifiable without exposing data"))))))},we=c().div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`,ke=c().h3`
  margin: 0;
  color: #333;
`,_e=c().div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`,Ce=c().h4`
  margin: 0 0 12px 0;
  color: #495057;
  font-size: 16px;
`,Se=c().div`
  margin-bottom: 12px;
`,ze=c().label`
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
  color: #495057;
  font-size: 14px;
`,Fe=c().select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`,Me=c().input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`,Ie=c().div`
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 4px;
  padding: 12px;
  margin-top: 8px;
  font-size: 13px;
  color: #0c5460;
`,Ae=({onConfigChange:e})=>{const[t,n]=(0,r.useState)("single"),[a,l]=(0,r.useState)(3),[o,c]=(0,r.useState)("max_entropy");return i().createElement(we,null,i().createElement(ke,null,"Active Learning Configuration"),i().createElement(Ie,{style:{marginBottom:"20px",background:"#e7f3ff",borderColor:"#b3d9ff",color:"#004085"}},i().createElement("strong",null,"🔧 Configuration in Microservices Architecture"),i().createElement("br",null),"Configuration is now handled during experiment initialization. The settings below show the current default configuration that will be used when initializing new experiments."),i().createElement(_e,null,i().createElement(Ce,null,"Model Update Strategy"),i().createElement(Se,null,i().createElement(ze,null,"Update Frequency"),i().createElement(Fe,{value:t,onChange:e=>n(e.target.value),disabled:!0},i().createElement("option",{value:"single"},"After Each Label (Single)"),i().createElement("option",{value:"batch"},"After Batch of Labels"))),"batch"===t&&i().createElement(Se,null,i().createElement(ze,null,"Batch Size"),i().createElement(Me,{type:"number",min:"1",max:"10",value:a,onChange:e=>l(parseInt(e.target.value)||1),disabled:!0})),i().createElement(Ie,null,i().createElement("strong",null,"Current:")," Single update strategy (immediate retraining after each label)",i().createElement("br",null),i().createElement("strong",null,"Note:")," Configuration is set during experiment initialization")),i().createElement(_e,null,i().createElement(Ce,null,"Query Strategy"),i().createElement(Se,null,i().createElement(ze,null,"Selection Method"),i().createElement(Fe,{value:o,onChange:e=>c(e.target.value),disabled:!0},i().createElement("option",{value:"uncertainty_sampling"},"Uncertainty Sampling"),i().createElement("option",{value:"random_sampling"},"Random Sampling"),i().createElement("option",{value:"margin_sampling"},"Margin Sampling"))),i().createElement(Ie,null,i().createElement("strong",null,"Current:")," Uncertainty Sampling (select samples with highest uncertainty)",i().createElement("br",null),i().createElement("strong",null,"Note:")," Query strategy is configured during experiment setup")),i().createElement(Ie,{style:{background:"#f8f9fa",borderColor:"#dee2e6",color:"#495057"}},i().createElement("strong",null,"💡 How to Configure:"),i().createElement("br",null),"1. Reset the current experiment if needed",i().createElement("br",null),"2. Initialize a new experiment with your desired configuration",i().createElement("br",null),"3. The AL Engine will use your specified model, query strategy, and update frequency"))},Pe=c().div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
`,$e=c().button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`,Le=c().div`
  font-family: monospace;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
`,Be=({account:e,onConnect:t,onDisconnect:n})=>{return i().createElement(Pe,null,e?i().createElement(i().Fragment,null,i().createElement(Le,null,"Connected: ",`${(a=e).slice(0,6)}...${a.slice(-4)}`),i().createElement($e,{onClick:n},"Disconnect")):i().createElement($e,{onClick:t},"Connect Wallet"));var a};async function Te(e,t={}){const{method:n="GET",body:a,headers:l={}}=t,r=`http://localhost:8000/${e.replace(/^\//,"")}`,i={method:n,headers:Object.assign({"Content-Type":"application/json"},l)};a&&"GET"!==n&&(i.body=JSON.stringify(a));try{const e=await fetch(r,i);if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);return await e.json()}catch(t){throw console.error(`API request failed for ${e}:`,t),t}}class De{static async initializeExperiment(e){const t={experiment_id:`experiment_${Date.now()}`,al_framework:{type:"sklearn"},model:{type:"random_forest",parameters:{n_estimators:50,random_state:42}},query_strategy:{type:"uncertainty_sampling"},dataset:{type:"wine",synthetic_samples:50}},n=await Te("experiments/initialize",{method:"POST",body:e||t});return"success"===n.status&&(this.currentExperimentId=n.experiment_id),n}static async getSystemStatus(){return await Te("system/status")}static async resetSystem(){const e=await Te("system/reset",{method:"POST"});return this.currentExperimentId=null,e}static async getExperimentStatus(){return this.currentExperimentId?await Te(`experiments/${this.currentExperimentId}/status`):{status:"error",error:"No active experiment"}}static async getNextSample(){if(!this.currentExperimentId)throw new Error("No active experiment");return await Te(`experiments/${this.currentExperimentId}/next-sample`)}static async submitLabel(e,t,n){if(!this.currentExperimentId)throw new Error("No active experiment");return await Te(`experiments/${this.currentExperimentId}/submit-label`,{method:"POST",body:{sample_id:e,label:t,metadata:n}})}static async getMetrics(){if(!this.currentExperimentId)throw new Error("No active experiment");return await Te(`experiments/${this.currentExperimentId}/metrics`)}static async getModelUpdates(e=10){return this.currentExperimentId?await Te(`experiments/${this.currentExperimentId}/model-updates?limit=${e}`):{status:"success",model_updates:{updates:[],performance_trend:[],summary:{total_updates:0,initial_accuracy:0,current_accuracy:0,total_improvement:0}}}}static async getBlockchainStatus(){return await Te("blockchain/status")}static async getRecentBlocks(e=10){return await Te(`blockchain/blocks?limit=${e}`)}static getCurrentExperimentId(){return this.currentExperimentId}static setCurrentExperimentId(e){this.currentExperimentId=e}}De.currentExperimentId=null;var Re=n(456);const je=c().div`
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
`,We=c().div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
`,Oe=c().h1`
  color: #1a202c;
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`,He=c().h2`
  color: #4a5568;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 400;
`,Ve=c().div`
  display: flex;
  flex-direction: column;
  height: 100%;
`,Ue=c().div`
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 1.5rem;
`,Ne=c().button`
  background: ${e=>e.active?"#3182ce":"transparent"};
  color: ${e=>e.active?"white":"#4a5568"};
  border: none;
  padding: 0.75rem 1rem;
  margin-right: 0.5rem;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${e=>e.active?"#2c5aa0":"#f7fafc"};
  }
`,qe=c().div`
  flex: 1;
  padding: 1rem 0;
`,Ye=c().div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`,Qe=c().h2`
  color: #2d3748;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
`,Ge=c().div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`,Je=c().div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin: 1rem 0;
`,Ke=c().h2`
  color: #0c4a6e;
  margin: 0 0 1rem 0;
  font-size: 1.8rem;
  font-weight: 700;
`,Xe=c().p`
  color: #075985;
  margin: 0 0 2rem 0;
  font-size: 1.1rem;
  line-height: 1.6;
`,Ze=c().div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`,et=c().button`
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(14, 165, 233, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(14, 165, 233, 0.4);
  }
  
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`,tt=c().div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-weight: 500;
`,nt=c().div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  
  ${e=>"loading"===e.status&&"\n    background: #fef3c7;\n    color: #d97706;\n    border: 1px solid #fcd34d;\n  "}
  
  ${e=>"ready"===e.status&&"\n    background: #d1fae5;\n    color: #065f46;\n    border: 1px solid #86efac;\n  "}
  
  ${e=>"error"===e.status&&"\n    background: #fef2f2;\n    color: #dc2626;\n    border: 1px solid #fecaca;\n  "}
`,at=c().div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
  border: 2px solid #fc8181;
  border-radius: 12px;
  position: relative;
`,lt=c().div`
  margin-top: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
  border: 2px solid #a855f7;
  border-radius: 12px;
`,rt=c().div`
  margin-top: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
`,it=c().button`
  background: ${e=>{switch(e.variant){case"danger":return"linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";case"warning":return"linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";case"primary":return"linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";default:return"linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"}}};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0.25rem;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`,ot=c().div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`,ct=c().h3`
  color: #c53030;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
`,st=c().button`
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2c5aa0;
    transform: scale(1.1);
  }
`,dt=c().div`
  display: flex;
  gap: 1rem;
  align-items: center;
`,mt=c().button`
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(197, 48, 48, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #c53030 0%, #9c2626 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(197, 48, 48, 0.4);
  }
  
  &:disabled {
    background: #a0a0a0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`,ut=c().div`
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #744210;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`,pt=c().div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`,gt=c().div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
`,ft=c().div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
`,Et=c().h2`
  color: #2d3748;
  margin: 0;
  font-size: 1.5rem;
`,bt=c().button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #a0aec0;
  cursor: pointer;
  
  &:hover {
    color: #4a5568;
  }
`,ht=c().ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
`,xt=c().li`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 4px solid #e53e3e;
`,yt=c().span`
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 2px;
`,vt=c().div`
  flex: 1;
`,wt=c().h4`
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  font-size: 1rem;
`,kt=c().p`
  margin: 0;
  color: #4a5568;
  font-size: 0.9rem;
  line-height: 1.4;
`,_t=c().div`
  background: linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%);
  border: 2px solid #f6ad55;
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
`,Ct=c().h3`
  color: #c05621;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`,St=c().div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`,zt=c().button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${e=>"primary"===e.variant&&"\n    background: #3182ce;\n    color: white;\n    &:hover { background: #2c5aa0; }\n  "}
  
  ${e=>"secondary"===e.variant&&"\n    background: #e2e8f0;\n    color: #4a5568;\n    &:hover { background: #cbd5e0; }\n  "}
  
  ${e=>"danger"===e.variant&&"\n    background: #e53e3e;\n    color: white;\n    &:hover { background: #c53030; }\n  "}
`,Ft=c().div`
  background: #edf2f7;
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
`,Mt=()=>{const[e,t]=(0,r.useState)("active-learning"),[n,a]=(0,r.useState)("checking"),[l,o]=(0,r.useState)(null),[c,s]=(0,r.useState)(!1),[d,m]=(0,r.useState)(!1),[u,g]=(0,r.useState)(!1),[f,E]=(0,r.useState)(!1),[b,h]=(0,r.useState)(!1),[y,v]=(0,r.useState)(!1),[w,k]=(0,r.useState)(!1),[_,C]=(0,r.useState)(!1),[S,z]=(0,r.useState)(!1),{currentSample:F,votingHistory:M,modelUpdates:I,blockchainData:A,refreshAll:P}=(()=>{const[e,t]=(0,r.useState)(null),[n,a]=(0,r.useState)(null),[l,i]=(0,r.useState)(null),[o,c]=(0,r.useState)(null),[s,d]=(0,r.useState)(null),[m,u]=(0,r.useState)(!1),[p,g]=(0,r.useState)(null),f=(0,r.useCallback)((async()=>{try{u(!0);const e=await De.getNextSample();if("success"!==e.status)throw new Error(e.error||"Failed to get sample");{const n=e.sample;t({id:n.sample_id,data:n.features,uncertainty:n.uncertainty_score,predicted_label:n.predicted_label,metadata:n.metadata}),g(null)}}catch(e){g(e instanceof Error?e.message:"Failed to fetch sample"),t(null)}finally{u(!1)}}),[]),E=(0,r.useCallback)((async()=>{try{const e=await De.getMetrics();"success"===e.status&&a(e.metrics)}catch(e){console.error("Failed to fetch model status:",e)}}),[]),b=(0,r.useCallback)((async()=>{try{i({votes:[],analytics:{total_votes:0,correct_votes:0,accuracy_rate:0,average_uncertainty:0,class_distribution:{}}})}catch(e){console.error("Failed to fetch voting history:",e)}}),[]),h=(0,r.useCallback)((async()=>{try{const e=await De.getModelUpdates();"success"===e.status?c(e.model_updates):c({updates:[],performance_trend:[],summary:{total_updates:0,initial_accuracy:0,current_accuracy:0,total_improvement:0}})}catch(e){console.error("Failed to fetch model updates:",e)}}),[]),x=(0,r.useCallback)((async()=>{try{const[e,t]=await Promise.all([De.getBlockchainStatus(),De.getRecentBlocks()]),n=t.blocks||[],a=e.total_blocks||0,l=e.total_transactions||0;d({on_chain:{vote_records:[],model_updates:n,total_blocks:a,total_gas_used:0,storage_size_kb:.5*l},off_chain:{vote_data:[],model_data:[],storage_size_kb:10},privacy_stats:{data_reduction_ratio:.95,features_hidden_on_chain:12,only_hashes_on_chain:l,full_audit_trail_available:!0}})}catch(e){console.error("Failed to fetch blockchain data:",e)}}),[]),y=(0,r.useCallback)((async()=>{try{u(!0),await De.initializeExperiment(),await Promise.all([f(),E(),b(),h(),x()])}catch(e){g(e instanceof Error?e.message:"Failed to initialize demo")}finally{u(!1)}}),[f,E,b,h,x]),v=(0,r.useCallback)((async()=>{await Promise.all([f(),E(),b(),h(),x()])}),[f,E,b,h,x]);return(0,r.useEffect)((()=>{v()}),[v]),{currentSample:e,modelMetrics:n,votingHistory:l,modelUpdates:o,blockchainData:s,loading:m,error:p,fetchCurrentSample:f,initializeDemo:y,refreshAll:v}})(),{submitVote:$}=(()=>{const[e,t]=(0,r.useState)(null),[n,a]=(0,r.useState)("idle"),[l,i]=(0,r.useState)(!1),[o,c]=(0,r.useState)(null),[s,d]=(0,r.useState)(null),m=(0,r.useCallback)((async(t,n=1)=>{if(!e)throw new Error("No sample available for voting");a("voting");try{const l=await De.submitLabel(e.id,t,{confidence:n});return a("submitted"),l}catch(e){throw console.error("Error submitting vote:",e),a("idle"),e}}),[e]),u=(0,r.useCallback)((async e=>{try{return{status:"success",session_id:`session_${Date.now()}`,message:"Voting session started"}}catch(e){throw console.error("Error starting voting session:",e),e}}),[]),p=(0,r.useCallback)((async e=>{try{return await De.getMetrics()}catch(e){throw console.error("Error getting voting results:",e),e}}),[]),g=(0,r.useCallback)((e=>{t(e),a("idle")}),[]),f=(0,r.useCallback)((async(e,t)=>{i(!0),c(null);try{const n=await De.submitLabel(e,t,{timestamp:Date.now()});return d(n),n}catch(e){const t=e instanceof Error?e.message:"Failed to submit vote";throw c(t),new Error(t)}finally{i(!1)}}),[]);return{currentSample:e,voteStatus:n,vote:m,startVotingSession:u,getVotingResults:p,setSampleForVoting:g,submitVote:f,isSubmitting:l,error:o,lastVoteResult:s}})(),{account:B,connect:T,disconnect:D}=(()=>{const[e,t]=(0,r.useState)(null),[n,a]=(0,r.useState)(null),l=(0,r.useCallback)((async()=>{if(void 0===window.ethereum)throw new Error("MetaMask is not installed");try{await window.ethereum.request({method:"eth_requestAccounts"});const e=new Re.ethers.providers.Web3Provider(window.ethereum);a(e);const n=e.getSigner(),l=await n.getAddress();t(l),window.ethereum.on("accountsChanged",(e=>{0===e.length?t(null):t(e[0])}))}catch(e){throw console.error("Error connecting wallet:",e),e}}),[]);return{account:e,provider:n,connect:l,disconnect:(0,r.useCallback)((()=>{t(null),a(null)}),[])}})();(0,r.useEffect)((()=>{B&&(R(),j())}),[B]);const R=async()=>{var e,t;try{const n=await De.getSystemStatus();if("success"===n.status){const l=(null===(t=null===(e=n.services)||void 0===e?void 0:e.orchestrator)||void 0===t?void 0:t.active_experiments)>0;a(l?"initialized":"not_initialized")}else a("not_initialized")}catch(e){console.error("Failed to check initialization status:",e),a("not_initialized")}},j=async()=>{try{const e=De.getCurrentExperimentId();v(!!e)}catch(e){console.error("Failed to check voting history:",e)}};return i().createElement(je,null,i().createElement(We,null,i().createElement(Oe,null,"Decentralized Active Learning"),i().createElement(He,null,"Collaborative ML with Privacy-Preserving Blockchain Integration")),B?B?"checking"===n?i().createElement(Je,null,i().createElement(nt,{status:"loading"},"Checking initialization status...")):"initializing"===n?i().createElement(Je,null,i().createElement(nt,{status:"loading"},"Initializing model and generating synthetic data...")):i().createElement(Ve,null,i().createElement(Ue,null,i().createElement(Ne,{active:"active-learning"===e,onClick:()=>t("active-learning")},"Active Learning"),i().createElement(Ne,{active:"voting-history"===e,onClick:()=>t("voting-history")},"Voting History"),i().createElement(Ne,{active:"model-performance"===e,onClick:()=>t("model-performance")},"Model Performance"),i().createElement(Ne,{active:"blockchain-simulation"===e,onClick:()=>t("blockchain-simulation")},"Blockchain Simulation"),i().createElement(Ne,{active:"configuration"===e,onClick:()=>t("configuration")},"Configuration")),i().createElement(qe,null,"active-learning"===e&&i().createElement(Ge,null,i().createElement(Ye,null,i().createElement(Qe,null,"Active Learning Interface"),"not_initialized"===n?i().createElement(nt,{status:"error"},"Model not initialized. Please initialize the model first using the Model Management section below."):i().createElement(i().Fragment,null,i().createElement(p,{sample:F}),i().createElement(x,{onVote:async e=>{if(F&&"initialized"===n&&B)try{await $(F.id,e),await P(),v(!0)}catch(e){console.error("Vote submission failed:",e)}},disabled:!F||"initialized"!==n})),l&&i().createElement(tt,null,l)),i().createElement(at,null,i().createElement(ot,null,i().createElement(ct,null,"Model Management"),i().createElement(st,{onClick:()=>{s(!0)},title:"Learn about reset and initialize processes"},"?")),i().createElement(dt,null,i().createElement(mt,{onClick:()=>{s(!1),m(!0)},disabled:f||!y,style:{background:y?void 0:"#94a3b8",cursor:y?void 0:"not-allowed"}},f?"Resetting...":"Reset Model"),i().createElement(et,{onClick:()=>{g(!0)},disabled:b||"initialized"===n||y,style:{background:"initialized"===n||y?"#94a3b8":void 0,cursor:"initialized"===n||y?"not-allowed":void 0}},b?"Initializing...":"Initialize Model")),i().createElement(ut,null,i().createElement("span",null,"Collaborative Environment:"),i().createElement("span",null,"Reset is only available after voting has started. Initialize is only available when the model is not initialized and no voting has occurred."))),i().createElement(i().Fragment,null,i().createElement(lt,null,i().createElement(ot,null,i().createElement(ct,null,"Session Management")),i().createElement("p",{style:{margin:"0 0 1rem 0",color:"#6b46c1",fontSize:"0.9rem"}},"Quit the current session while remaining as a participant in the experiment."),i().createElement(it,{variant:"primary",onClick:()=>k(!0),disabled:S},S?"Quitting Session...":"Quit Session")),i().createElement(rt,null,i().createElement(ot,null,i().createElement(ct,null,"Wallet Management")),i().createElement("p",{style:{margin:"0 0 1rem 0",color:"#d97706",fontSize:"0.9rem"}},"Disconnect your wallet and completely log out of the session."),i().createElement(it,{variant:"warning",onClick:()=>C(!0)},"Disconnect Wallet")))),"voting-history"===e&&i().createElement(Ye,null,i().createElement(Qe,null,"Voting History & Analytics"),i().createElement(L,{votingHistory:M})),"model-performance"===e&&i().createElement(Ye,null,i().createElement(Qe,null,"Model Performance Tracking"),i().createElement(ee,{modelUpdates:I})),"blockchain-simulation"===e&&i().createElement(Ye,null,i().createElement(Qe,null,"Blockchain Privacy Simulation"),i().createElement(ve,{blockchainData:A})),"configuration"===e&&i().createElement(Ye,null,i().createElement(Qe,null,"System Configuration"),i().createElement(Ae,null))),c?i().createElement(pt,{onClick:()=>s(!1)},i().createElement(gt,{onClick:e=>e.stopPropagation()},i().createElement(bt,{onClick:()=>s(!1)},"×"),i().createElement(ft,null,i().createElement(Et,null,"Model Management Guide")),i().createElement("div",null,i().createElement("p",null,"The interface provides two separate operations for managing your active learning experiment with smart state management:"),i().createElement(ht,null,i().createElement(xt,null,i().createElement(yt,null,"Reset"),i().createElement(vt,null,i().createElement(wt,null,"Reset Model"),i().createElement(kt,null,"Clears all voting history, model updates, performance tracking, and model state. Only available after voting has started to prevent accidental resets."))),i().createElement(xt,null,i().createElement(yt,null,"Init"),i().createElement(vt,null,i().createElement(wt,null,"Initialize Model"),i().createElement(kt,null,"Performs warm start training on the original Wine dataset (178 samples) and generates 100 synthetic samples for active learning. Only available when model is not initialized and no voting has occurred.")))),i().createElement(_t,null,i().createElement(Ct,null,"Smart State Management"),i().createElement("ul",{style:{margin:"0.5rem 0",paddingLeft:"1.5rem"}},i().createElement("li",null,i().createElement("strong",null,"Reset Button:")," Disabled (grey) until voting starts to prevent accidental data loss"),i().createElement("li",null,i().createElement("strong",null,"Initialize Button:")," Disabled (grey) once model is initialized or voting has started"),i().createElement("li",null,"This prevents common mistakes like resetting before any work is done"),i().createElement("li",null,"Ensures proper workflow: Connect Wallet → Initialize → Vote → Reset (if needed)"))),i().createElement(Ft,null,i().createElement("h4",{style:{margin:"0 0 0.5rem 0",color:"#2d3748"}},"Collaborative Workflow"),i().createElement("p",{style:{margin:0,fontSize:"0.9rem",color:"#4a5568"}},"In a production environment with multiple researchers, these actions should be:"),i().createElement("ul",{style:{margin:"0.5rem 0",paddingLeft:"1.5rem",fontSize:"0.9rem",color:"#4a5568"}},i().createElement("li",null,"Proposed by one team member via smart contract"),i().createElement("li",null,"Voted on by all collaborators through blockchain consensus"),i().createElement("li",null,"Executed only with majority approval and proper authorization"),i().createElement("li",null,"Logged with timestamp, reason, and voting results for audit trails")))),i().createElement(St,null,i().createElement(zt,{variant:"secondary",onClick:()=>s(!1)},"Close Guide")))):null,d?i().createElement(pt,{onClick:()=>m(!1)},i().createElement(gt,{onClick:e=>e.stopPropagation()},i().createElement(bt,{onClick:()=>m(!1)},"×"),i().createElement(ft,null,i().createElement(Et,null,"Confirm Model Reset")),i().createElement("div",null,i().createElement("p",{style:{fontSize:"1.1rem",marginBottom:"1.5rem"}},"Are you sure you want to reset the active learning model?"),i().createElement(_t,null,i().createElement(Ct,null,"This Will Permanently Delete:"),i().createElement("ul",{style:{margin:"0.5rem 0",paddingLeft:"1.5rem"}},i().createElement("li",null,i().createElement("strong",null,"All voting history")," and user label submissions"),i().createElement("li",null,i().createElement("strong",null,"Model performance tracking")," and improvement metrics"),i().createElement("li",null,i().createElement("strong",null,"Blockchain simulation data")," (on-chain and off-chain records)"),i().createElement("li",null,i().createElement("strong",null,"Current model state")," and training progress"))),i().createElement("div",{style:{background:"#fff5f5",border:"1px solid #fc8181",borderRadius:"6px",padding:"1rem",margin:"1rem 0"}},i().createElement("h4",{style:{margin:"0 0 0.5rem 0",color:"#c53030"}},"Important:"),i().createElement("p",{style:{margin:0,fontSize:"0.9rem",color:"#744210"}},"After reset, the model will be ",i().createElement("strong",null,"uninitialized"),". You will need to run",i().createElement("strong",null," Initialize Model")," separately to train the model and generate synthetic data.")),i().createElement(ut,null,i().createElement("span",null,"Team Notice:"),i().createElement("span",null,"In collaborative environments, consider getting team approval before resetting shared experimental data."))),i().createElement(St,null,i().createElement(zt,{variant:"secondary",onClick:()=>m(!1)},"Cancel"),i().createElement(zt,{variant:"danger",onClick:async()=>{E(!0),m(!1);try{const e=await De.resetSystem();"success"===e.status?(a("not_initialized"),v(!1),await P()):o(e.error||"Reset failed")}catch(e){o("Failed to reset model"),console.error("Reset failed:",e)}finally{E(!1)}}},"Yes, Reset Model")))):null,u?i().createElement(pt,{onClick:()=>g(!1)},i().createElement(gt,{onClick:e=>e.stopPropagation()},i().createElement(bt,{onClick:()=>g(!1)},"×"),i().createElement(ft,null,i().createElement(Et,null,"Confirm Model Initialization")),i().createElement("div",null,i().createElement("p",{style:{fontSize:"1.1rem",marginBottom:"1.5rem"}},"Initialize the active learning model with warm start training?"),i().createElement("div",{style:{background:"#e6fffa",border:"1px solid #38b2ac",borderRadius:"6px",padding:"1rem",margin:"1rem 0"}},i().createElement("h4",{style:{margin:"0 0 0.5rem 0",color:"#234e52"}},"This Will Create:"),i().createElement("ul",{style:{margin:"0.5rem 0",paddingLeft:"1.5rem",fontSize:"0.9rem"}},i().createElement("li",null,"Model trained on original Wine dataset (178 samples)"),i().createElement("li",null,"100 new synthetic wine samples for active learning"),i().createElement("li",null,"Clean analytics dashboards ready for experiments"),i().createElement("li",null,"Baseline performance metrics"))),i().createElement(_t,null,i().createElement(Ct,null,"Prerequisites"),i().createElement("p",{style:{margin:"0.5rem 0",fontSize:"0.9rem"}},"The system must be in an uninitialized state. If already initialized, please reset first before running initialization.")),i().createElement(ut,null,i().createElement("span",null,"Team Notice:"),i().createElement("span",null,"This will establish the baseline model that all team members will collaborate on for active learning."))),i().createElement(St,null,i().createElement(zt,{variant:"secondary",onClick:()=>g(!1)},"Cancel"),i().createElement(zt,{variant:"primary",onClick:async()=>{g(!1),h(!0),a("initializing"),o(null);try{const e=await De.initializeExperiment();"success"===e.status?(a("initialized"),await P()):(o(e.error||"Initialization failed"),a("not_initialized"))}catch(e){o("Failed to initialize model"),a("not_initialized"),console.error("Initialization failed:",e)}finally{h(!1)}}},"Yes, Initialize Model")))):null,w?i().createElement(pt,{onClick:()=>k(!1)},i().createElement(gt,{onClick:e=>e.stopPropagation()},i().createElement(bt,{onClick:()=>k(!1)},"×"),i().createElement(ft,null,i().createElement(Et,null,"Confirm Quit Session")),i().createElement("div",null,i().createElement("p",{style:{fontSize:"1.1rem",marginBottom:"1.5rem"}},"Are you sure you want to quit the current session?"),i().createElement("div",{style:{background:"#f0f9ff",border:"1px solid #0ea5e9",borderRadius:"6px",padding:"1rem",margin:"1rem 0"}},i().createElement("h4",{style:{margin:"0 0 0.5rem 0",color:"#0c4a6e"}},"What happens when you quit:"),i().createElement("ul",{style:{margin:"0.5rem 0",paddingLeft:"1.5rem",fontSize:"0.9rem"}},i().createElement("li",null,"Your local session data will be cleared"),i().createElement("li",null,"You will remain a participant in the experiment"),i().createElement("li",null,"Your wallet stays connected"),i().createElement("li",null,"You can rejoin the session anytime"),i().createElement("li",null,"Your previous contributions are preserved"))),i().createElement(ut,null,i().createElement("span",null,"Note:"),i().createElement("span",null,"This is different from disconnecting your wallet - you'll still be logged in and can quickly rejoin the experiment."))),i().createElement(St,null,i().createElement(zt,{variant:"secondary",onClick:()=>k(!1)},"Cancel"),i().createElement(zt,{variant:"primary",onClick:async()=>{z(!0);try{console.log("Quitting session but remaining as participant"),await P(),a("not_initialized"),t("active-learning"),k(!1),alert("Session quit successfully. You remain a participant in the experiment.")}catch(e){console.error("Failed to quit session:",e),alert("Failed to quit session. Please try again.")}finally{z(!1)}}},"Yes, Quit Session")))):null,_?i().createElement(pt,{onClick:()=>C(!1)},i().createElement(gt,{onClick:e=>e.stopPropagation()},i().createElement(bt,{onClick:()=>C(!1)},"×"),i().createElement(ft,null,i().createElement(Et,null,"Confirm Disconnect Wallet")),i().createElement("div",null,i().createElement("p",{style:{fontSize:"1.1rem",marginBottom:"1.5rem"}},"Are you sure you want to disconnect your wallet?"),i().createElement(_t,null,i().createElement(Ct,null,"This Will:"),i().createElement("ul",{style:{margin:"0.5rem 0",paddingLeft:"1.5rem"}},i().createElement("li",null,i().createElement("strong",null,"Completely log you out")," of the session"),i().createElement("li",null,i().createElement("strong",null,"Clear all local data")," and session state"),i().createElement("li",null,i().createElement("strong",null,"Require wallet reconnection")," to rejoin"),i().createElement("li",null,i().createElement("strong",null,"End your current session")," participation"))),i().createElement("div",{style:{background:"#e6fffa",border:"1px solid #38b2ac",borderRadius:"6px",padding:"1rem",margin:"1rem 0"}},i().createElement("h4",{style:{margin:"0 0 0.5rem 0",color:"#234e52"}},"Your contributions remain safe:"),i().createElement("p",{style:{margin:0,fontSize:"0.9rem"}},"All your previous votes and model contributions are permanently stored on the blockchain and will not be lost."))),i().createElement(St,null,i().createElement(zt,{variant:"secondary",onClick:()=>C(!1)},"Cancel"),i().createElement(zt,{variant:"danger",onClick:async()=>{try{D(),a("not_initialized"),t("active-learning"),C(!1),console.log("Wallet disconnected and session cleared")}catch(e){console.error("Failed to disconnect wallet:",e),alert("Failed to disconnect wallet. Please try again.")}}},"Yes, Disconnect Wallet")))):null):null:i().createElement(Je,null,i().createElement(Ke,null,"Wallet Connection Required"),i().createElement(Xe,null,"Welcome to the Decentralized Active Learning System!",i().createElement("br",null),"Please connect your wallet to participate in collaborative machine learning.",i().createElement("br",null),"Your wallet address will be used for authentication and voting verification."),i().createElement(Ze,null,i().createElement(Be,{account:B,onConnect:T,onDisconnect:D}))))};class It extends a.ReactWidget{constructor(){super(),this.addClass("dal-widget")}render(){return i().createElement(Mt,null)}}const At=new(n(666).LabIcon)({name:"dal:brain",svgstr:'<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="16"\n  height="16"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n  class="lucide lucide-brain-circuit"\n>\n  <path\n    d="M12 5a3 3 0 1 0-5.997.142A3 3 0 0 0 6 11H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2"\n  />\n  <path\n    d="M12 5a3 3 0 1 1 5.997.142A3 3 0 0 1 18 11h2a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2"\n  />\n  <path\n    d="M6 11a3 3 0 1 0-5.997-.142A3 3 0 0 0 0 5h2a1 1 0 0 1 1 1v3"\n  />\n  <path\n    d="M18 11a3 3 0 1 1 5.997-.142A3 3 0 0 1 24 5h-2a1 1 0 0 0-1 1v3"\n  />\n  <path\n    d="M12 11a3 3 0 1 0-5.997.142A3 3 0 0 0 6 17H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h2"\n  />\n  <path\n    d="M12 11a3 3 0 1 1 5.997.142A3 3 0 0 1 18 17h2a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2"\n  />\n  <path d="M12 17a3 3 0 1 0-5.997.142A3 3 0 0 0 6 23h2a1 1 0 0 0 1-1v-3" />\n  <path d="M12 17a3 3 0 1 1 5.997.142A3 3 0 0 1 18 23h2a1 1 0 0 1 1-1v-3" />\n</svg> '}),Pt={id:"jupyterlab-dal-extension:plugin",autoStart:!0,requires:[a.ICommandPalette],optional:[l.ILauncher],activate:(e,t,n)=>{console.log("JupyterLab extension jupyterlab-dal-extension is activated!");const l="dal:open";e.commands.addCommand(l,{label:"DAL Model Management",caption:"Open DAL Decentralized Active Learning Interface",icon:At,execute:()=>{const t=new It,n=new a.MainAreaWidget({content:t});n.id="dal-jupyterlab-widget-"+Date.now(),n.title.label="DAL Model Management",n.title.icon=At,n.title.closable=!0,e.shell.add(n,"main"),e.shell.activateById(n.id)}}),t.addItem({command:l,category:"DAL"}),n&&n.add({command:l,category:"DAL Framework",rank:1})}}}}]);