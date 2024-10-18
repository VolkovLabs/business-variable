import { getTemplateSrv } from '@grafana/runtime';
import { sceneGraph } from '@grafana/scenes';
import { act, renderHook, waitFor } from '@testing-library/react';

import { VariableType } from '../types';
import { useRuntimeVariables } from './useRuntimeVariables';

/**
 * Mock @grafana/runtime
 */
jest.mock('@grafana/runtime', () => ({
  getTemplateSrv: jest.fn(() => ({
    getVariables: jest.fn(() => []),
  })),
}));

/**
 * Mock @grafana/scenes
 */
jest.mock('@grafana/scenes', () => ({
  sceneGraph: {
    getVariables: jest.fn(),
  },
  sceneUtils: {
    isQueryVariable: jest.fn(() => false),
    isCustomVariable: jest.fn(() => true),
    isDataSourceVariable: jest.fn(() => false),
    isTextBoxVariable: jest.fn(() => false),
    isConstantVariable: jest.fn(() => false),
    isIntervalVariable: jest.fn(() => false),
    isAdHocVariable: jest.fn(() => false),
  },
}));

/**
 * Create eventBus mock
 */
const createEventBus = () => {
  let subscriber: () => void;

  return {
    getStream: jest.fn(() => ({
      subscribe: jest.fn((handler) => {
        subscriber = handler;
        return {
          unsubscribe: jest.fn(),
        };
      }),
    })),
    publish: () => {
      if (subscriber) {
        subscriber();
      }
    },
  };
};

describe('Use Runtime Variables', () => {
  const eventBus: any = createEventBus();

  const senseVariable = {
    state: {
      type: VariableType.CUSTOM,
      name: 'room',
      value: '1',
      text: 'Room1',
      options: [
        {
          text: 'Room1',
          value: '1',
        },
      ],
      datasource: {
        type: 'static',
        uid: 'testId',
      },
      regex: '',
      query: 'query',
      refresh: 1,
      sort: 0,
      label: 'Room',
      includeAll: true,
      isMulti: false,
      skipUrlSync: false,
      hide: 0,
      definition: 'definition',
      key: 'unique-1-key',
      loading: false,
      error: null,
    },
  };

  const variableDevice = {
    name: 'device',
    type: VariableType.CUSTOM,
    options: [
      {
        text: 'Device1',
        value: '1',
      },
    ],
  };
  const variableCountry = {
    name: 'country',
    type: VariableType.CUSTOM,
    options: [],
  };
  jest.mocked(getTemplateSrv).mockImplementation(
    () =>
      ({
        getVariables: jest.fn(() => [variableCountry, variableDevice]),
      }) as any
  );

  beforeEach(() => {
    /**
     * delete __grafanaSceneContext
     */
    delete window.__grafanaSceneContext;
  });

  it('Should return variable', () => {
    const { result } = renderHook(() => useRuntimeVariables(eventBus, 'device'));

    expect(result.current.variable).toEqual({
      ...variableDevice,
      optionIndexByName: expect.any(Map),
      helpers: {
        getOption: expect.any(Function),
      },
    });
  });

  it('Should return variable for dashboard scene', () => {
    window.__grafanaSceneContext = {
      body: {
        text: 'hello',
      },
    };

    jest.mocked(sceneGraph.getVariables).mockReturnValue({
      state: {
        variables: [senseVariable],
      },
    } as any);

    const { result } = renderHook(() => useRuntimeVariables(eventBus, 'room'));

    expect(result.current.variable).toEqual(
      expect.objectContaining({
        name: 'room',
        current: { value: '1', text: 'Room1' },
        options: [
          { text: 'All', value: '$__all', selected: false },
          { value: '1', text: undefined, selected: true },
        ],
        includeAll: true,
        optionIndexByName: expect.any(Map),
        helpers: {
          getOption: expect.any(Function),
        },
      })
    );
  });

  it('Should update variable in dashboard scene', async () => {
    window.__grafanaSceneContext = {
      body: {
        text: 'hello',
      },
    };

    jest.mocked(sceneGraph.getVariables).mockReturnValue({
      state: {
        variables: [senseVariable],
      },
    } as any);

    const { result } = renderHook(() => useRuntimeVariables(eventBus, 'room'));

    expect(result.current.variable).toEqual(
      expect.objectContaining({
        name: 'room',
        current: { value: '1', text: 'Room1' },
        options: [
          { text: 'All', value: '$__all', selected: false },
          { value: '1', text: undefined, selected: true },
        ],
        includeAll: true,
        optionIndexByName: expect.any(Map),
        helpers: {
          getOption: expect.any(Function),
        },
      })
    );

    /**
     * Update variables
     */
    jest.mocked(sceneGraph.getVariables).mockReturnValue({
      state: {
        variables: [],
      },
    } as any);

    /**
     * Trigger refresh event
     */
    await act(() => eventBus.publish());

    /**
     * Check if updated variable returns
     */
    await waitFor(() => expect(result.current.variable).not.toBeDefined());
  });

  it('Should update variable in dashboard scene', async () => {
    window.__grafanaSceneContext = {
      body: {
        text: 'hello',
      },
    };

    jest.mocked(sceneGraph.getVariables).mockReturnValue({
      state: {
        variables: [senseVariable],
      },
    } as any);

    const { result } = renderHook(() => useRuntimeVariables(eventBus, 'room'));

    expect(result.current.variable).toEqual(
      expect.objectContaining({
        name: 'room',
        current: { value: '1', text: 'Room1' },
        options: [
          { text: 'All', value: '$__all', selected: false },
          { value: '1', text: undefined, selected: true },
        ],
        includeAll: true,
        optionIndexByName: expect.any(Map),
        helpers: {
          getOption: expect.any(Function),
        },
      })
    );

    /**
     * Update variables
     */
    jest.mocked(sceneGraph.getVariables).mockReturnValue({
      state: {
        variables: [],
      },
    } as any);

    /**
     * Trigger refresh event
     */
    await act(() => eventBus.publish());

    /**
     * Check if updated variable returns
     */
    await waitFor(() => expect(result.current.variable).not.toBeDefined());
  });

  it('Should not return variable for dashboard scene if scene doesn`t return variable', () => {
    window.__grafanaSceneContext = {
      body: {
        text: 'hello',
      },
    };

    /**
     * sceneGraph returns "room"
     */
    jest.mocked(sceneGraph.getVariables).mockReturnValue({
      state: {
        variables: [senseVariable],
      },
    } as any);

    /**
     * Try to get "device"
     */
    const { result } = renderHook(() => useRuntimeVariables(eventBus, 'device'));

    expect(result.current.variable).not.toBeDefined();
  });

  it('Should update variable', async () => {
    const { result } = renderHook(() => useRuntimeVariables(eventBus, 'device'));

    expect(result.current.variable).toEqual({
      ...variableDevice,
      optionIndexByName: expect.any(Map),
      helpers: {
        getOption: expect.any(Function),
      },
    });

    /**
     * Update variables
     */
    jest.mocked(getTemplateSrv).mockImplementation(
      () =>
        ({
          getVariables: jest.fn(() => []),
        }) as any
    );

    /**
     * Trigger refresh event
     */
    await act(() => eventBus.publish());

    /**
     * Check if updated variable returns
     */
    await waitFor(() => expect(result.current.variable).not.toBeDefined());
  });
});
