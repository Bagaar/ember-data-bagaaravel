import { RELATIONSHIP_ADAPTER_OPTION } from '@bagaaravel/ember-data-extensions/config'
import saveRelationship from '@bagaaravel/ember-data-extensions/utils/save-relationship'
import JSONAPIAdapter from 'ember-data/adapters/json-api'
import JSONAPISerializer from 'ember-data/serializers/json-api'
import { setupTest } from 'ember-qunit'
import { module, test } from 'qunit'
import createExistingRecord from '../../helpers/create-existing-record'

module('Unit | Utility | save-relationship', function (hooks) {
  setupTest(hooks)

  test('"saveRelationship" throws when the record is new', function (assert) {
    let store = this.owner.lookup('service:store')
    let newUser = store.createRecord('user')

    assert.throws(() => {
      saveRelationship(newUser, 'company')
    })
  })

  test('"saveRelationship" throws when the relationship name is not valid', function (assert) {
    let store = this.owner.lookup('service:store')
    let existingUser = createExistingRecord(store, 'user')

    assert.throws(() => {
      saveRelationship(existingUser, 'invalid-relationship-name')
    })
  })

  test('"saveRelationship" throws when the relationship can not be serialized', function (assert) {
    let UserSerializer = JSONAPISerializer.extend({
      attrs: {
        company: {
          serialize: false
        }
      }
    })

    this.owner.register('serializer:user', UserSerializer)

    let store = this.owner.lookup('service:store')
    let existingUser = createExistingRecord(store, 'user')

    assert.throws(() => {
      saveRelationship(existingUser, 'company')
    })
  })

  test('"saveRelationship" works', async function (assert) {
    let relationshipName = 'company'

    let UserAdapter = JSONAPIAdapter.extend({
      ajax () {},
      urlForUpdateRecord (id, modelName, snapshot) {
        assert.equal(
          snapshot.adapterOptions[RELATIONSHIP_ADAPTER_OPTION],
          relationshipName
        )
      }
    })

    this.owner.register('adapter:user', UserAdapter)

    let store = this.owner.lookup('service:store')
    let existingUser = createExistingRecord(store, 'user')

    await saveRelationship(existingUser, relationshipName)
  })
})