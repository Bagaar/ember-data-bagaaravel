import RelationshipSupportSerializerMixin from '@bagaaravel/ember-data-extensions/mixins/relationship-support-serializer'
import { saveRelationship } from '@bagaaravel/ember-data-extensions/model'
import {
  keyForAttribute,
  keyForRelationship,
  payloadKeyFromModelName,
  shouldSerializeHasMany
} from '@bagaaravel/ember-data-extensions/serializer'
import JSONAPIAdapter from '@ember-data/adapter/json-api'
import JSONAPISerializer from '@ember-data/serializer/json-api'
import { setupTest } from 'ember-qunit'
import { module, test } from 'qunit'
import createExistingRecord from '../../helpers/create-existing-record'

class UserSerializer extends JSONAPISerializer.extend(
  {
    keyForAttribute () {
      return keyForAttribute(...arguments)
    },

    keyForRelationship () {
      return keyForRelationship(...arguments)
    },

    payloadKeyFromModelName () {
      return payloadKeyFromModelName(...arguments)
    },

    shouldSerializeHasMany () {
      const superCheck = this._super(...arguments)

      return shouldSerializeHasMany(superCheck, ...arguments)
    }
  },
  RelationshipSupportSerializerMixin
) {}

module('Unit | Mixin | relationship-support-serializer', function (hooks) {
  setupTest(hooks)

  test('saving a record', async function (assert) {
    let serialized

    class UserAdapter extends JSONAPIAdapter {
      ajax (url, type, options) {
        serialized = options.data
      }
    }

    this.owner.register('adapter:user', UserAdapter)
    this.owner.register('serializer:user', UserSerializer)

    const store = this.owner.lookup('service:store')
    const existingUser = createExistingRecord(store, 'user', {
      firstName: 'First Name'
    })

    await existingUser.save()

    assert.deepEqual(serialized, {
      data: {
        attributes: {
          first_name: 'First Name'
        },
        id: existingUser.id,
        type: 'User'
      }
    })
  })

  test('saving a belongsTo relationship', async function (assert) {
    let serialized

    class UserAdapter extends JSONAPIAdapter {
      ajax (url, type, options) {
        serialized = options.data
      }
    }

    this.owner.register('adapter:user', UserAdapter)
    this.owner.register('serializer:user', UserSerializer)

    const store = this.owner.lookup('service:store')
    const existingUser = createExistingRecord(store, 'user')

    await saveRelationship(existingUser, 'company')

    assert.deepEqual(serialized, {
      data: null
    })

    const existingCompany = createExistingRecord(store, 'company')

    existingUser.set('company', existingCompany)

    await saveRelationship(existingUser, 'company')

    assert.deepEqual(serialized, {
      data: {
        id: existingCompany.id,
        type: 'Company'
      }
    })
  })

  test('saving an hasMany relationship', async function (assert) {
    let serialized

    class UserAdapter extends JSONAPIAdapter {
      ajax (url, type, options) {
        serialized = options.data
      }
    }

    this.owner.register('adapter:user', UserAdapter)
    this.owner.register('serializer:user', UserSerializer)

    const store = this.owner.lookup('service:store')
    const existingUser = createExistingRecord(store, 'user')

    await saveRelationship(existingUser, 'projects')

    assert.deepEqual(serialized, {
      data: []
    })

    const existingProject = createExistingRecord(store, 'project')

    existingUser.projects.addObject(existingProject)

    await saveRelationship(existingUser, 'projects')

    assert.deepEqual(serialized, {
      data: [
        {
          id: existingProject.id,
          type: 'Project'
        }
      ]
    })
  })
})
