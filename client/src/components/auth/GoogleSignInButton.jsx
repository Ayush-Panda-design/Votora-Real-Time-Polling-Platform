import { memo, useCallback } from 'react';
import { GoogleLogin } from '@react-oauth/google';

/**
 * Single shared GIS button — avoids duplicate google.accounts.id.initialize()
 * when login/signup pages remount the widget.
 */
const GoogleSignInButton = memo(({ onSuccess, onError, text = 'signin_with' }) => {
  const handleSuccess = useCallback(
    (credentialResponse) => onSuccess?.(credentialResponse),
    [onSuccess],
  );
  const handleError = useCallback(
    () => onError?.(),
    [onError],
  );

  return (
    <div className="flex justify-center mb-5">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="filled_black"
        shape="pill"
        text={text}
        width="340"
        useOneTap={false}
        auto_select={false}
      />
    </div>
  );
});

GoogleSignInButton.displayName = 'GoogleSignInButton';

export default GoogleSignInButton;
