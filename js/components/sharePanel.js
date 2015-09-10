/********************************************************************
  SHARING SCREEN
*********************************************************************/
/**
* The screen used while the video is playing.
*
* @class PlayingScreen
* @constructor
*/
var React = require('react'),
    Utils = require('./utils'),
    InlineStyle = require('../styles/inlineStyle');

var SharePanel = React.createClass({
  tabs: {SHARE: "share", EMBED: "embed", EMAIL: "email"},

  componentDidMount: function(){
    if (Utils.isSafari()){
      InlineStyle.shareScreenStyle.containerStyle.display = "-webkit-flex";
      InlineStyle.shareScreenStyle.tabRowStyle.display = "-webkit-flex";
    }
    else {
      InlineStyle.shareScreenStyle.containerStyle.display = "flex";
      InlineStyle.shareScreenStyle.tabRowStyle.display = "flex";
    }
  },


  getDefaultProps: function() {
    return {
      controller: {
        state: {
          isMobile: false
        }
      }
    };
  },


  getInitialState: function() {
    this.isMobile = this.props.controller.state.isMobile;
    return {
      activeTab: this.tabs.SHARE,
    };
  },

  getActivePanel: function() {
    var shareStyle = InlineStyle.shareScreenStyle;
    if (this.state.activeTab === this.tabs.SHARE) {
      var twitterIconStyle = Utils.extend(shareStyle.socialIconStyle, shareStyle.twitterIconStyle);
      var facebookIconStyle = Utils.extend(shareStyle.socialIconStyle, shareStyle.facebookIconStyle);
      var plusIconStyle = Utils.extend(shareStyle.socialIconStyle, shareStyle.plusIconStyle);

      return (
        <div className="shareTabPanel" style={shareStyle.panelStyle}>
          <div style={shareStyle.titleStyle}>{(this.props.contentTree && this.props.contentTree.title) || ""}</div>
          <div className="twitter" onClick={this.handleTwitterClick} onTouchEnd={this.handleTwitterClick} style={twitterIconStyle}>t</div>
          <div className="facebook" onClick={this.handleFacebookClick} onTouchEnd={this.handleFacebookClick} style={facebookIconStyle}>f</div>
          <div className="googlePlus" onClick={this.handleGPlusClick} onTouchEnd={this.handleGPlusClick} style={plusIconStyle}>g+</div><br/>
          <input className="embedUrl" style={shareStyle.embedUrlStyle} type='text' defaultValue={location.href}/><br/>
          <input className="startPointCheckBox" style={{marginBottom: "15px"}}type='checkbox'/>
            Start at <input className="startPointTextField" style={shareStyle.startAtInput} type='text'
            defaultValue={Utils.formatSeconds(this.props.currentPlayhead)}/><br/>
        </div>
      );
    }
    else if (this.state.activeTab === this.tabs.EMBED) {
      return (
        <div className="shareTabPanel" style={shareStyle.panelStyle}>
          <textarea className="embedTextArea" style={shareStyle.embedTextArea}>
            &lt;script src="//player.ooyala.com/v4/"&gt;&lt;/script&gt;
          </textarea>
        </div>
      );
    }
    else if (this.state.activeTab === this.tabs.EMAIL) {
      return (
        <div className="shareTabPanel" style={shareStyle.panelStyle}>
          <table style={{color: "white"}}>
            <tr>
              <td style={{paddingLeft: "5px"}}>To</td>
              <td style={{width: "10px"}}></td>
              <td><input ref="sharePanelTo" onFocus={this.handleFieldFocus}
                style={shareStyle.emailInputField} type='text' defaultValue='recipient'/></td>
            </tr>
            <tr>
              <td>Subject</td>
              <td style={{width: "10px"}}></td>
              <td><input ref="sharePanelSubject" onFocus={this.handleFieldFocus}
                style={shareStyle.emailInputField} type='text' defaultValue='subject'/><br/></td>
            </tr>
            <tr>
              <td>Message</td>
              <td style={{width: "10px"}}></td>
              <td><textarea className="sharePanelMessage" ref="sharePanelMessage" onFocus={this.handleFieldFocus} style={shareStyle.emailTextArea}>
                Optional Message
              </textarea></td>
            </tr>
            <tr>
              <td></td>
              <td style={{width: "10px"}}></td>
              <td style={{textAlign: "right"}}>
                <button className="emailSendButton" onClick={this.handleEmailClick} onTouchEnd={this.handleEmailClick} style={shareStyle.emailSendButton}>Send</button></td>
            </tr>
          </table>
        </div>
      );
    }
  },

  handleEmailClick: function(evt) {
    if (evt.type == 'touchend' || !this.isMobile){
      //since mobile would fire both click and touched events,
      //we need to make sure only one actually does the work

      var mailToUrl = "mailto:";
      mailToUrl += this.refs.sharePanelTo.getDOMNode().value;
      mailToUrl += "?subject=" + encodeURIComponent(this.refs.sharePanelSubject.getDOMNode().value);
      mailToUrl += "&body=" + encodeURIComponent(this.refs.sharePanelMessage.getDOMNode().value);
      location.href = mailToUrl;
    }
  },

  handleFacebookClick: function(evt) {
    if (evt.type == 'touchend' || !this.isMobile){
      //since mobile would fire both click and touched events,
      //we need to make sure only one actually does the work

      var facebookUrl = "http://www.facebook.com/sharer.php";
      facebookUrl += "?u=" + encodeURIComponent(location.href);
      window.open(facebookUrl, "facebook window", "height=315,width=780");
    }
  },

  handleFieldFocus: function(evt) {
    evt.target.style.color = "black";
    evt.target.value = "";
  },

  handleGPlusClick: function(evt) {
    if (evt.type == 'touchend' || !this.isMobile){
      //since mobile would fire both click and touched events,
      //we need to make sure only one actually does the work

      var gPlusUrl = "https://plus.google.com/share";
      gPlusUrl += "?url=" + encodeURIComponent(location.href);
      window.open(gPlusUrl, "google+ window", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600");
    }
  },

  handleTwitterClick: function(evt) {
     if (evt.type == 'touchend' || !this.isMobile){
      //since mobile would fire both click and touched events,
      //we need to make sure only one actually does the work

      var twitterUrl = "https://twitter.com/intent/tweet";
      twitterUrl += "?text=" + encodeURIComponent(this.props.contentTree.title+": ");
      twitterUrl += "&url=" + encodeURIComponent(location.href);
      window.open(twitterUrl, "twitter window", "height=300,width=750");
    }
  },

  showPanel: function(panelToShow, evt) {
    if (evt.type == 'touchend' || !this.isMobile){
      //since mobile would fire both click and touched events,
      //we need to make sure only one actually does the work

      this.setState({activeTab: panelToShow});
    }
  },

  render: function() {
    var shareStyle = InlineStyle.shareScreenStyle;
    var activeTabStyle = Utils.extend(shareStyle.tabStyle, shareStyle.activeTab);
    var activeLastTabStyle = Utils.extend(shareStyle.lastTabStyle, shareStyle.activeTab);

    return (
      <div style={shareStyle.containerStyle}>
        <div className="tabRow" style={shareStyle.tabRowStyle}>
          <span className="shareTab" onClick={this.showPanel.bind(this, this.tabs.SHARE)}
            onTouchEnd={this.showPanel.bind(this, this.tabs.SHARE)}
            style={(this.state.activeTab == this.tabs.SHARE) ? activeTabStyle : shareStyle.tabStyle}>Share</span>
          <span className="embedTab" onClick={this.showPanel.bind(this, this.tabs.EMBED)}
            onTouchEnd={this.showPanel.bind(this, this.tabs.EMBED)}
            style={(this.state.activeTab == this.tabs.EMBED) ? activeTabStyle : shareStyle.tabStyle}>Embed</span>
          <span className="emailTab" onClick={this.showPanel.bind(this, this.tabs.EMAIL)}
            onTouchEnd={this.showPanel.bind(this, this.tabs.EMAIL)}
            style={(this.state.activeTab == this.tabs.EMAIL) ? activeLastTabStyle : shareStyle.lastTabStyle}>Email</span>
        </div>
        {this.getActivePanel()}
      </div>
    );
  }
});
module.exports = SharePanel;