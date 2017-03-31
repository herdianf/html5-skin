/********************************************************************
 SHARE PANEL
 *********************************************************************/
/**
 * Panel component for Share Screen.
 *
 * @class SharePanel
 * @constructor
 */
var React = require('react'),
    ClassNames = require('classnames'),
    Utils = require('./utils'),
    CONSTANTS = require('../constants/constants');

var SharePanel = React.createClass({
  tabs: {SHARE: "share", EMBED: "embed"},

  getInitialState: function() {
    return {
      activeTab: this.tabs.SHARE,
      hasError: false
    };
  },

  handleCheckboxClick: function(event) {
    this.setState({shareAtTime: event.target.checked});
  },

  handleUrlClick: function(event) {
    var target = event.target,
        currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);
    var succeed=false;
    try {
        succeed = document.execCommand("copy");
    } catch(e) {
        succeed = false;
        target.removeAttribute('readonly');
    }
    if (currentFocus)
        currentFocus.focus()
  },

  handleTimeChange: function(event) {
    var el = event.target,
        value = el.value;
    var a = value.split(':');
    var seconds = a.pop();
    var minutes = a.length > 0 ? a.pop() : 0;
    var hours = a.length > 0 ? a.pop() : 0;
    var totalSeconds = ((+hours) * 60 * 60) + ((+minutes) * 60) + (+seconds);
    if (totalSeconds > this.props.duration) {
      totalSeconds=this.props.duration;
    }

    var params = {userPlayHeadTime: totalSeconds, shareAtTime: true}
    this.setState(params);
  },

  getActivePanel: function() {
    var initialTime = isFinite(parseInt(this.props.currentPlayhead)) ? parseInt(this.props.currentPlayhead) : 0;
    if ( this.state.userPlayHeadTime ) {
        initialTime = parseInt(this.state.userPlayHeadTime);
    }

    var playheadTime = Utils.formatSeconds(initialTime);

    if (this.state.activeTab === this.tabs.SHARE) {
      var titleString = Utils.getLocalizedString(this.props.language, CONSTANTS.SKIN_TEXT.SHARE_CALL_TO_ACTION, this.props.localizableStrings);
      var shareUrl = this.getShareLocation();

      return (
        <div className="oo-share-tab-panel">
          <div className="oo-social-action-text oo-text-capitalize">{titleString}</div>
          <a className="oo-facebook" onClick={this.handleFacebookClick}> </a>
          <a className="oo-twitter" onClick={this.handleTwitterClick}> </a>
          <a className="oo-linkedin" onClick={this.handleLinkedInClick}> </a>
          <a className="oo-email-share" onClick={this.handleEmailClick}> </a>
          <div className="share-url-text"><input type="url" readOnly value={shareUrl} onClick={this.handleUrlClick}/></div>
          <label className="share-check-label">
            <input type="checkbox" checked={this.state.shareAtTime} onChange={this.handleCheckboxClick} />
            Share At
          </label>
          <input className="share-time-text" type="text" value={playheadTime} onChange={this.handleTimeChange} />
        </div>
      );
    } else if (this.state.activeTab === this.tabs.EMBED) {
      try {
        var iframeURL = this.props.skinConfig.shareScreen.embed.source
          .replace("<ASSET_ID>", this.props.assetId)
          .replace("<PLAYER_ID>", this.props.playerParam.playerBrandingId)
          .replace("<PUBLISHER_ID>", this.props.playerParam.pcode);

		if (this.state.shareAtTime) {
			iframeURL=iframeURL.replace('&pcode=', '&options[initialTime]='+initialTime+'&pcode=');
		}

      } catch(err) {
        iframeURL = "";
      }

      return (
        <div className="oo-share-tab-panel">
          <textarea className="oo-form-control"
                    rows="3"
                    value={iframeURL}
                    readOnly />
        </div>
      );
    }
  },

  getShareLocation: function() {
    var shareAtTime = this.state.shareAtTime || false;
	if (shareAtTime) {
	  var playheadTime = isFinite(parseInt(this.props.currentPlayhead)) ? parseInt(this.props.currentPlayhead) : '';
	  if ( this.state.userPlayHeadTime ) {
	    playheadTime = parseInt(this.state.userPlayHeadTime);
	  }
	  var qs= location.search ? location.search.substring(1).split('&')
		.map(function(x){
			return x.split('=',2).map(function(i){
				return decodeURI(i.trim()).replace('+', ' ');
			})
		})
	   .reduce(function(m,x){m[x[0]]=x[1];return m},{}) : {};
	  qs['t']=playheadTime;
	  qs['autoplay']='1';
	  var str=''
	  for(var k in qs) {
		if (str.length > 0) str += '&';
		str += encodeURIComponent(k) + '=' + encodeURIComponent(qs[k]);
	  }
	  return (location.search ? location.href.substring(0, location.href.indexOf('?')) : location.href) + '?' + str;
	} else{ 
	  return location.href;
	}
  },

  handleEmailClick: function(event) {
    event.preventDefault();
    var emailBody = Utils.getLocalizedString(this.props.language, CONSTANTS.SKIN_TEXT.EMAIL_BODY, this.props.localizableStrings);
    var mailToUrl = "mailto:";
    mailToUrl += "?subject=" + encodeURIComponent(this.props.contentTree.title);
    mailToUrl += "&body=" + encodeURIComponent(emailBody + this.getShareLocation());
    //location.href = mailToUrl; //same window
    var emailWindow = window.open(mailToUrl, "email", "height=315,width=780"); //new window
    setTimeout(function(){
      try {
         // If we can't access href, a web client has taken over and this will throw
         // an exception, preventing the window from being closed.
        var test = emailWindow.location.href;
        emailWindow.close()
      } catch(e) {};
      // Generous 2 second timeout to give the window time to redirect if it's going to a web client
    }, 2000);
  },

  handleLinkedInClick: function() {
    var linkedInUrl = 'https://www.linkedin.com/shareArticle?mini=true'+
        '&url='+encodeURIComponent(this.getShareLocation()) +
        '&title='+encodeURIComponent(this.props.contentTree.title)+
        '&source=ChannelNewsAsia.com';
    window.open(linkedInUrl, "linkedin window", "height=315,width=780");
  },

  handleFacebookClick: function() {
    var facebookUrl = "http://www.facebook.com/sharer.php";
    facebookUrl += "?u=" + encodeURIComponent(this.getShareLocation());
    window.open(facebookUrl, "facebook window", "height=315,width=780");
  },

  handleGPlusClick: function() {
    var gPlusUrl = "https://plus.google.com/share";
    gPlusUrl += "?url=" + encodeURIComponent(this.getShareLocation());
    window.open(gPlusUrl, "google+ window", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600");
  },

  handleTwitterClick: function() {
    var twitterUrl = "https://twitter.com/intent/tweet";
    twitterUrl += "?text=" + encodeURIComponent(this.props.contentTree.title+": ");
    twitterUrl += "&url=" + encodeURIComponent(this.getShareLocation());
    window.open(twitterUrl, "twitter window", "height=300,width=750");
  },

  showPanel: function(panelToShow) {
    this.setState({activeTab: panelToShow});
  },

  render: function() {
    var shareTab = ClassNames({
      'oo-share-tab': true,
      'oo-active': this.state.activeTab == this.tabs.SHARE
    });
    var embedTab = ClassNames({
      'oo-embed-tab': true,
      'oo-active': this.state.activeTab == this.tabs.EMBED
    });

    var shareString = Utils.getLocalizedString(this.props.language, CONSTANTS.SKIN_TEXT.SHARE, this.props.localizableStrings),
        embedString = Utils.getLocalizedString(this.props.language, CONSTANTS.SKIN_TEXT.EMBED, this.props.localizableStrings);

    return (
      <div className="oo-content-panel oo-share-panel">
        <div className="oo-tab-row">
          <a className={shareTab} onClick={this.showPanel.bind(this, this.tabs.SHARE)}>{shareString}</a>
          <a className={embedTab} onClick={this.showPanel.bind(this, this.tabs.EMBED)}>{embedString}</a>
        </div>
        {this.getActivePanel()}
      </div>
    );
  }
});

SharePanel.defaultProps = {
  contentTree: {
    title: ''
  }
};

module.exports = SharePanel;