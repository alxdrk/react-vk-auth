import React, { Component } from 'react';
import { parse, stringify } from 'query-string';
import { bool, number, string, func, shape, oneOfType, oneOf } from 'prop-types';

class VkLogin extends Component {
  static propTypes = {
    appId: oneOfType([number, string]).isRequired,
    callback: func.isRequired,
    onError: func.isRequired,
    permissions: number,
    disabled: bool,
    type: oneOf(['link', 'sdk']),
    params: shape({
      redirect_uri: string,
      display: string,
      scope: string,
      response_type: string,
      v: string,
      state: string,
      revoke: number,
    }),
  };

  static defaultProps = {
    type: 'sdk',
    params: {
      display: 'page',
      response_type: 'token',
      v: '5.85',
      state: JSON.stringify({ provider: 'vk' }),
    },
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoaded: false,
      isProcessing: false,
    };
  }

  componentDidMount() {
    if (this.props.type === 'sdk') {
      document.getElementById('vk-sdk') ? this.setState(() => ({ isLoaded: true })) : null;
      this.vkAsyncInit();
      this.loadSdk();
    }

    if (this.props.type === 'link') {
      this.setState(() => ({ isLoaded: true }));

      const response = this.getResponseFromLocation();

      if (!response) {
      }
    }
  }

  getResponseFromLocation() {
    const { hash, search } = window.location;
    let params = parse(search);

    if (!params.code) {
      params = parse(hash);
    }

    if (!params.state || this.getProvider(params.state) !== 'vk') {
      return null;
    }

    if (params.access_token || params.code) {
      const { expires_in, user_id } = params;
      const token = params.access_token || params.code;

      return {
        token,
        expires_in,
        user_id,
        provider: 'vk',
      };
    } else if (params.error && params.error_description) {
      this.props.onError(decodeURIComponent(params.error_description));
      return null;
    }
  }

  getProvider(state) {
    try {
      const { provider } = JSON.parse(state);
      return provider;
    } catch (e) {
      return null;
    }
  }

  vkAsyncInit() {
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

  getRedirectUri() {
    const { origin, pathname } = window.location;
    return `${origin}${pathname}`;
  }

  compileRedirectUrl() {
    const { appId } = this.props;
    const redirect_uri = this.props.params.redirect_uri || this.getRedirectUri();

    const params = stringify({
      client_id: appId,
      redirect_uri,
      ...this.props.params,
    });

    return `https://oauth.vk.com/authorize?${params}`;
  }

  handleClick = () => {
    if (!this.state.isLoaded || this.state.isProcessing || this.props.disabled) {
      return;
    }

    this.setState(() => ({ isProcessing: true }));

    if (this.props.type === 'sdk') {
      window.VK.Auth.login(this.checkLoginState, this.props.permissions);
    }

    if (this.props.type === 'link') {
      window.location.href = this.compileRedirectUrl();
    }
  };

  render() {
    const { disabled } = this.props;

    return (
      <span className="vk-login-button-container">
        <button
          type="button"
          className="vk-login-button"
          onClick={this.handleClick}
          disabled={disabled}
        >
          werwer
        </button>
      </span>
    );
  }
}

export default VkLogin;
