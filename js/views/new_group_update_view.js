/* vim: ts=4:sw=4:expandtab
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
(function () {
    'use strict';
    window.Whisper = window.Whisper || {};

    Whisper.NewGroupUpdateView = Whisper.View.extend({
        tagName:   "div",
        className: "new-group-update-form",
        template: $('#new-group-update-form').html(),
        initialize: function(options) {
            this.render();
            this.avatarInput = new Whisper.FileInputView({
                el: this.$('.group-avatar'),
                window: options.window
            });

            this.recipients_view = new Whisper.RecipientsInputView({
                placeholder: "Add member"
            });
            this.$('.scrollable').append(this.recipients_view.el);

            this.$('.avatar').addClass('default');

            this.member_list_view = new Whisper.ConversationListView({
                collection: this.model.contactCollection,
                className: 'members'
            });
            this.member_list_view.render();
            this.$('.scrollable').append(this.member_list_view.el);
        },
        events: {
            'click .back': 'goBack',
            'click .send': 'send',
            'keyup input.search': 'toggleResults'
        },
        toggleResults: function() {
            if (this.recipients_view.$input.val().length >= 2) {
                this.$('.results').show();
            } else {
                this.$('.results').hide();
            }
        },
        goBack: function() {
            this.trigger('back');
        },
        render_attributes: function() {
            return {
                name: this.model.getTitle(),
                avatar_url: this.model.getAvatarUrl()
            };
        },
        send: function() {
            return this.avatarInput.getThumbnail().then(function(avatarFile) {
                this.model.set({
                    name: this.$('.name').val(),
                    members: _.union(this.model.get('members'), this.recipients_view.recipients.pluck('id'))
                });
                if (avatarFile) {
                    this.model.set({avatar: avatarFile});
                    this.model.trigger('change:avatar');
                }
                this.model.save();
                textsecure.messaging.updateGroup(
                    this.model.id,
                    this.model.get('name'),
                    this.model.get('avatar'),
                    this.model.get('members')
                );
                this.goBack();
            }.bind(this));
        }
    });
})();
