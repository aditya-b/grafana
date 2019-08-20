import React, { PureComponent } from 'react';
import { UserProvider } from 'app/core/utils/UserProvider';
import { UserProfileEditForm } from 'app/core/components/user/UserProfileEditForm';

export interface Props {
  userId: number;
}

export class ReactUserEditWrapper extends PureComponent<Props> {
  render() {
    return (
      <UserProvider userId={this.props.userId}>
        {(api, states, user) => {
          return (
            <>
              {!states.loadUser && (
                <UserProfileEditForm
                  updateProfile={api.updateUserProfile}
                  isSavingUser={states.updateUserProfile}
                  user={user}
                />
              )}
            </>
          );
        }}
      </UserProvider>
    );
  }
}

export default ReactUserEditWrapper;
