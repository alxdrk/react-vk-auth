import React, { Component } from 'react';
import { bool, number, string, func, oneOfType } from 'prop-types';

class VkLogin extends Component {
  static propTypes = {
    appId: oneOfType([number, string]).isRequired,
    callback: func.isRequired,
    permissions: number,
    disabled: bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoaded: false,
      isProcessing: false,
    };
  }

  componentDidMount() {
    document.getElementById('vk-sdk') ? this.setState(() => ({ isLoaded: true })) : null;
    this.init();
    this.loadSdk();
  }

  init() {
    const { appId } = this.props;

    window.vkAsyncInit = () => {
      window.VK.init({ apiId: appId });
      this.setState(() => ({ isLoaded: true }));
    };
  }

  loadSdk() {
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = 'https://vk.com/js/api/openapi.js?159';
    script.async = true;
    script.id = 'vk-sdk';

    document.getElementsByTagName('head')[0].appendChild(script);
  }

  checkLoginState = response => {
    this.setState(() => ({ isProcessing: false }));

    this.props.callback ? this.props.callback(response) : null;
  };

  handleClick = () => {
    if (!this.state.isLoaded || this.state.isProcessing || this.props.disabled) {
      return;
    }

    this.setState(() => ({ isProcessing: true }));
    window.VK.Auth.login(this.checkLoginState, this.props.permissions);
  };

  render() {
    const { disabled, ...props } = this.props;

    return (
      <span>
        <button
          type="button"
          className="vk-login-button"
          onClick={this.handleClick}
          disabled={disabled}
          {...props}
        >
          title
        </button>
      </span>
    );
  }
}

export default VkLogin;
