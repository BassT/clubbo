/*global
    Meteor, Roles, Accounts, Clubs, Departments, Teams, _, check
 */

Meteor.methods({
    createUserAccount: function (user, addedToContextIds) {
        'use strict';
        var userId, loggedInUser, i, teamIds;

        loggedInUser = Meteor.user();

        if (!loggedInUser) {
            throw new Meteor.Error(403, 'Access denied');
        }

        for (i = 0; i < addedToContextIds.length; i = i + 1) {
            if (!Roles.userIsInRole(loggedInUser, 'admin', addedToContextIds[i])) {
                throw new Meteor.Error(403, 'Insufficient admin rights!');
            }
        }

        userId = Accounts.createUser({
            email: user.email,
            password: user.password,
            profile: user.profile
        });

        if (user.profile.teamIds) {
            teamIds = user.profile.teamIds;
            for (i = 0; i < teamIds.length; i = i + 1) {
                Teams.update(teamIds[i], {
                    $push: {userIds: userId}
                });
            }
        }

        return userId;
    },
    updateProfile: function (user) {
        'use strict';
        var loggedInUser, oldUserProfile, oldTeamIds,
            newTeamIds, setObj;

        loggedInUser = Meteor.user();

        if (!loggedInUser) {
            throw new Meteor.Error(403, 'Access denied');
        }

        setObj = {
            'profile.firstName': user.profile.firstName,
            'profile.lastName': user.profile.lastName,
            'profile.birthday': user.profile.birthday,
            'profile.address': user.profile.address,
            'profile.phone': user.profile.phone,
            'profile.gender': user.profile.gender,
            'profile.jerseyNumber': user.profile.jerseyNumber,
            'profile.positions': user.profile.positions
        };

        oldUserProfile = Meteor.users.findOne(user._id).profile;
        oldTeamIds = oldUserProfile.teamIds;

        // add teamIds property to setObj only if different
        if (_.difference(oldTeamIds, user.profile.teamIds).length > 0 ||
            _.difference(user.profile.teamIds, oldTeamIds).length > 0) {
            setObj['profile.teamIds'] = user.profile.teamIds;
        }

        Meteor.users.update({_id: user._id}, {
            $set: setObj
        });

        newTeamIds = user.profile.teamIds;

        Teams.update({_id: {$in: _.difference(oldTeamIds, newTeamIds)}}, {
            $pull: {userIds: user._id}
        });
        Teams.update({_id: {$in: _.difference(newTeamIds, oldTeamIds)}}, {
            $push: {userIds: user._id}
        });
    },
    deleteUser: function (userId) {
        'use strict';
        var loggedInUser, user;

        loggedInUser = Meteor.user();
        user = Meteor.users.findOne(userId);

        if (!loggedInUser ||  loggedInUser._id === userId) {
            throw new Meteor.Error(403, 'Access denied');
        }

        Teams.update({_id: {$in: user.profile.teamIds}}, {
            $pull: {userIds: userId}
        });

        Meteor.users.remove(userId);
    },
    addAdmin: function (teamId, userId) {
        'use strict';
        check(teamId, String);
        check(userId, String);

        if (!Roles.userIsInRole(Meteor.userId(), 'admin', teamId)) {
            throw new Meteor.Error(403, 'Not an admin in this team.');
        }

        Roles.addUsersToRoles(userId, 'admin', teamId);

        return true;
    },
    removeAdmin: function (teamId, userId) {
        'use strict';
        check(teamId, String);
        check(userId, String);

        if (!Roles.userIsInRole(Meteor.userId(), 'admin', teamId)) {
            throw new Meteor.Error(403, 'Not an admin in this team.');
        }

        if (Roles.getUsersInRole('admin', teamId).count() === 1) {
            throw new Meteor.Error(409, 'Team needs to have at least one admin.');
        }

        Roles.removeUsersFromRoles(userId, 'admin', teamId);

        return true;
    }
});