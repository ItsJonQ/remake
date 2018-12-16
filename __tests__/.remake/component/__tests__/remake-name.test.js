import React from 'react'
import { mount } from 'enzyme'
import { <%= name %> } from '../<%= name %>'

test('Can render <%= name %>', () => {
  const wrapper = mount(<<%= name %> />)

  expect(wrapper).toBeTruthy()
})