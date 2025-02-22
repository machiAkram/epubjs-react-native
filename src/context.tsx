import React, {
  createContext,
  useCallback,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import type WebView from 'react-native-webview';
import type {
  ePubCfi,
  FontSize,
  Location,
  Mark,
  SearchResult,
  Theme,
} from './types';

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

enum Types {
  CHANGE_THEME = 'CHANGE_THEME',
  CHANGE_FONT_SIZE = 'CHANGE_FONT_SIZE',
  CHANGE_FONT_FAMILY = 'CHANGE_FONT_FAMILY',
  SET_AT_START = 'SET_AT_START',
  SET_AT_END = 'SET_AT_END',
  SET_KEY = 'SET_KEY',
  SET_TOTAL_LOCATIONS = 'SET_TOTAL_LOCATIONS',
  SET_CURRENT_LOCATION = 'SET_CURRENT_LOCATION',
  SET_PROGRESS = 'SET_PROGRESS',
  SET_LOCATIONS = 'SET_LOCATIONS',
  SET_IS_LOADING = 'SET_IS_LOADING',
  SET_IS_RENDERING = 'SET_IS_RENDERING',
  SET_SEARCH_RESULTS = 'SET_SEARCH_RESULTS',
  SET_CURRENT_HTMl = 'SET_CURRENT_HTML',
}

type BookPayload = {
  [Types.CHANGE_THEME]: Theme;
  [Types.CHANGE_FONT_SIZE]: FontSize;
  [Types.CHANGE_FONT_FAMILY]: string;
  [Types.SET_AT_START]: boolean;
  [Types.SET_AT_END]: boolean;
  [Types.SET_KEY]: string;
  [Types.SET_TOTAL_LOCATIONS]: number;
  [Types.SET_CURRENT_LOCATION]: Location;
  [Types.SET_PROGRESS]: number;
  [Types.SET_LOCATIONS]: ePubCfi[];
  [Types.SET_IS_LOADING]: boolean;
  [Types.SET_IS_RENDERING]: boolean;
  [Types.SET_SEARCH_RESULTS]: SearchResult[];
  [Types.SET_CURRENT_HTMl]: string;
};

type BookActions = ActionMap<BookPayload>[keyof ActionMap<BookPayload>];

type InitialState = {
  theme: Theme;
  fontFamily: string;
  fontSize: FontSize;
  atStart: boolean;
  atEnd: boolean;
  key: string;
  totalLocations: number;
  currentLocation: Location | null;
  progress: number;
  locations: ePubCfi[];
  isLoading: boolean;
  isRendering: boolean;
  searchResults: SearchResult[];
  currentHtml: string;
};

export const defaultTheme: Theme = {
  'body': {
    background: '#fff',
  },
  'span': {
    color: '#000 !important',
  },
  'p': {
    color: '#000 !important',
  },
  'li': {
    color: '#000 !important',
  },
  'h1': {
    color: '#000 !important',
  },
  'a': {
    'color': '#000 !important',
    'pointer-events': 'auto',
    'cursor': 'pointer',
  },
  '::selection': {
    background: 'lightskyblue',
  },
};

const initialState: InitialState = {
  theme: defaultTheme,
  fontFamily: 'Helvetica',
  fontSize: '12pt',
  atStart: false,
  atEnd: false,
  key: '',
  totalLocations: 0,
  currentLocation: null,
  progress: 0,
  locations: [],
  isLoading: true,
  isRendering: true,
  searchResults: [],
  currentHtml: '',
};

function bookReducer(state: InitialState, action: BookActions): InitialState {
  switch (action.type) {
    case Types.CHANGE_THEME:
      return {
        ...state,
        theme: action.payload,
      };
    case Types.CHANGE_FONT_SIZE:
      return {
        ...state,
        fontSize: action.payload,
      };
    case Types.CHANGE_FONT_FAMILY:
      return {
        ...state,
        fontFamily: action.payload,
      };
    case Types.SET_AT_START:
      return {
        ...state,
        atStart: action.payload,
      };
    case Types.SET_AT_END:
      return {
        ...state,
        atEnd: action.payload,
      };
    case Types.SET_KEY:
      return {
        ...state,
        key: action.payload,
      };
    case Types.SET_TOTAL_LOCATIONS:
      return {
        ...state,
        totalLocations: action.payload,
      };
    case Types.SET_CURRENT_LOCATION:
      return {
        ...state,
        currentLocation: action.payload,
      };
    case Types.SET_PROGRESS:
      return {
        ...state,
        progress: action.payload,
      };
    case Types.SET_LOCATIONS:
      return {
        ...state,
        locations: action.payload,
      };
    case Types.SET_IS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case Types.SET_IS_RENDERING:
      return {
        ...state,
        isRendering: action.payload,
      };
    case Types.SET_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload,
      };
    case Types.SET_CURRENT_HTMl:
      return {
        ...state,
        currentHtml: action.payload,
      };
    default:
      return state;
  }
}

export interface ReaderContextProps {
  registerBook: (bookRef: WebView) => void;
  setAtStart: (atStart: boolean) => void;
  setAtEnd: (atEnd: boolean) => void;
  setTotalLocations: (totalLocations: number) => void;
  setCurrentLocation: (location: Location) => void;
  setProgress: (progress: number) => void;
  setLocations: (locations: ePubCfi[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsRendering: (isRendering: boolean) => void;

  /**
   * Go to specific location in the book
   * @param {ePubCfi} target {@link ePubCfi}
   */
  goToLocation: (cfi: ePubCfi) => void;

  /**
   * Go to specific location in the book
   * @param {number} target {@link number}
   */
  goToLocationWithNumber: (location: number) => void;

  /**
   * Go to previous page in the book
   */
  goPrevious: () => void;

  /**
   * Go to next page in the book
   */
  goNext: () => void;

  /**
   * Get the total locations of the book
   */
  getLocations: () => ePubCfi[];

  /**
   * Returns the current location of the book
   * @returns {Location} {@link Location}
   */
  getCurrentLocation: () => Location | null;

  /**
   * Search for a specific text in the book
   * @param {string} query {@link string} text to search
   */
  search: (query: string) => void;

  /**
   * Calculate current page's html
   */
  calculateHtml: () => void;

  /**
   * @param theme {@link Theme}
   * @description Theme object.
   * @example
   * ```
   * selectTheme({ body: { background: '#fff' } });
   * ```
   */
  changeTheme: (theme: Theme) => void;

  /**
   * Change font size of all elements in the book
   * @param font
   * @see https://www.w3schools.com/cssref/css_websafe_fonts.asp
   */
  changeFontFamily: (fontFamily: string) => void;

  /**
   * Change font size of all elements in the book
   * @param {FontSize} size {@link FontSize}
   */
  changeFontSize: (size: FontSize) => void;

  /**
   * Add Mark a specific cfi in the book
   */
  addMark: (
    type: Mark,
    cfiRange: ePubCfi,
    data?: any,
    callback?: () => void,
    className?: string,
    styles?: any
  ) => void;

  /**
   * Remove Mark a specific cfi in the book
   */
  removeMark: (cfiRange: ePubCfi, type: Mark) => void;

  setKey: (key: string) => void;

  /**
   * Works like a unique id for book
   */
  key: string;

  /**
   * A theme object.
   */
  theme: Theme;

  /**
   * Indicates if you are at the beginning of the book
   * @returns {boolean} {@link boolean}
   */
  atStart: boolean;

  /**
   * Indicates if you are at the end of the book
   * @returns {boolean} {@link boolean}
   */
  atEnd: boolean;

  /**
   * The total number of locations
   */
  totalLocations: number;

  /**
   * The current location of the book
   */
  currentLocation: Location | null;

  /**
   * The progress of the book
   * @returns {number} {@link number}
   */
  progress: number;

  locations: ePubCfi[];

  /**
   * Indicates if the book is loading
   * @returns {boolean} {@link boolean}
   */
  isLoading: boolean;

  /**
   * Indicates if the book is rendering
   * @returns {boolean} {@link boolean}
   */
  isRendering: boolean;

  /**
   * Search results
   * @returns {SearchResult[]} {@link SearchResult[]}
   */
  searchResults: SearchResult[];

  /**
   * Current html
   * @returns {string} {@link string}
   */
  currentHtml: string;

  setSearchResults: (results: SearchResult[]) => void;

  setCurrentHtml: (html: string) => void;
}

const ReaderContext = createContext<ReaderContextProps>({
  registerBook: () => {},
  setAtStart: () => {},
  setAtEnd: () => {},
  setTotalLocations: () => {},
  setCurrentLocation: () => {},
  setProgress: () => {},
  setLocations: () => {},
  setIsLoading: () => {},
  setIsRendering: () => {},

  goToLocation: () => {},
  goToLocationWithNumber: () => {},
  goPrevious: () => {},
  goNext: () => {},
  getLocations: () => [],
  getCurrentLocation: () => null,
  search: () => {},
  calculateHtml: () => {},

  changeTheme: () => {},
  changeFontFamily: () => {},
  changeFontSize: () => {},

  addMark: () => {},
  removeMark: () => {},

  setKey: () => {},
  key: '',

  theme: defaultTheme,
  atStart: false,
  atEnd: false,
  totalLocations: 0,
  currentLocation: null,
  progress: 0,
  locations: [],
  isLoading: true,
  isRendering: true,

  searchResults: [],
  setSearchResults: () => {},

  currentHtml: '',
  setCurrentHtml: () => {},
});

function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bookReducer, initialState);
  const book = useRef<WebView | null>(null);

  const registerBook = useCallback((bookRef: WebView) => {
    book.current = bookRef;
  }, []);

  const changeTheme = useCallback((theme: Theme) => {
    book.current?.injectJavaScript(`
      rendition.themes.register({ theme: ${JSON.stringify(theme)} });
      rendition.themes.select('theme');
      rendition.views().forEach(view => view.pane ? view.pane.render() : null); true;
    `);
    dispatch({ type: Types.CHANGE_THEME, payload: theme });
  }, []);

  const changeFontFamily = useCallback((fontFamily: string) => {
    book.current?.injectJavaScript(`
      rendition.themes.font('${fontFamily}');
    `);
    dispatch({ type: Types.CHANGE_FONT_FAMILY, payload: fontFamily });
  }, []);

  const changeFontSize = useCallback((size: FontSize) => {
    book.current?.injectJavaScript(`
      rendition.themes.override('line-height','1.5',true);
      rendition.themes.fontSize('${size}'); true
    `);
    dispatch({ type: Types.CHANGE_FONT_SIZE, payload: size });
  }, []);

  const setAtStart = useCallback((atStart: boolean) => {
    dispatch({ type: Types.SET_AT_START, payload: atStart });
  }, []);

  const setAtEnd = useCallback((atEnd: boolean) => {
    dispatch({ type: Types.SET_AT_END, payload: atEnd });
  }, []);

  const setTotalLocations = useCallback((totalLocations: number) => {
    dispatch({ type: Types.SET_TOTAL_LOCATIONS, payload: totalLocations });
  }, []);

  const setCurrentLocation = useCallback((location: Location) => {
    dispatch({ type: Types.SET_CURRENT_LOCATION, payload: location });
  }, []);

  const setProgress = useCallback((progress: number) => {
    dispatch({ type: Types.SET_PROGRESS, payload: progress });
  }, []);

  const setLocations = useCallback((locations: ePubCfi[]) => {
    dispatch({ type: Types.SET_LOCATIONS, payload: locations });
  }, []);

  const setIsLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: Types.SET_IS_LOADING, payload: isLoading });
  }, []);

  const setIsRendering = useCallback((isRendering: boolean) => {
    dispatch({ type: Types.SET_IS_RENDERING, payload: isRendering });
  }, []);

  const goToLocation = useCallback((targetCfi: ePubCfi) => {
    book.current?.injectJavaScript(`rendition.display('${targetCfi}'); true`);
  }, []);

  const goToLocationWithNumber = useCallback((location: number) => {
    book.current?.injectJavaScript(`
      var cfi = book.locations.cfiFromLocation(${location});
      rendition.display(cfi.toString()); true
    `);
  }, []);

  const goPrevious = useCallback(() => {
    book.current?.injectJavaScript(`rendition.prev(); true`);
  }, []);

  const goNext = useCallback(() => {
    book.current?.injectJavaScript(`rendition.next(); true`);
  }, []);

  const getLocations = useCallback(() => state.locations, [state.locations]);

  const getCurrentLocation = useCallback(() => state.currentLocation, [
    state.currentLocation,
  ]);

  const search = useCallback((query: string) => {
    book.current?.injectJavaScript(`
      Promise.all(
        book.spine.spineItems.map((item) => {
          return item.load(book.load.bind(book)).then(() => {
            let results = item.find('${query}'.trim());
            item.unload();
            return Promise.resolve(results);
          });
        })
      ).then((results) =>
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'onSearch', results: [].concat.apply([], results) })
        )
      ); true
    `);
  }, []);

  const calculateHtml = useCallback(() => {
    book.current?.injectJavaScript(`
      let html = '';
      const [a, b] = [rendition.currentLocation().start.cfi, rendition.currentLocation().end.cfi]
      book.getRange(makeRangeCfi(a, b)).then(range => {
        //html = range.cloneContents().childNodes[0].innerHTML;
        html = range.toString();
      }).finally(() => window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'onHtml', html: html })  
      )); true
    `);
  },[]);

  const setSearchResults = useCallback((results: SearchResult[]) => {
    dispatch({ type: Types.SET_SEARCH_RESULTS, payload: results });
  }, []);

  const setCurrentHtml = useCallback((html: string) => {
    dispatch({ type: Types.SET_CURRENT_HTMl, payload: html });
  }, []);

  const addMark = useCallback(
    (
      type: Mark,
      cfiRange: string,
      data?: any,
      callback?: () => void,
      className?: string,
      styles?: any
    ) => {
      const defaultStyles = { fill: 'yellow' };

      book.current?.injectJavaScript(`
      rendition.annotations.add('${type}', '${cfiRange}', ${JSON.stringify(
        data ?? {}
      )}, ${JSON.stringify(
        callback ? callback() : () => {}
      )}, '${className}', ${JSON.stringify(styles ?? defaultStyles)}); true
    `);
    },
    []
  );

  const removeMark = useCallback((cfiRange: string, type: Mark) => {
    book.current?.injectJavaScript(`
      rendition.annotations.remove('${cfiRange}', '${type}'); true
    `);
  }, []);

  const setKey = useCallback((key: string) => {
    dispatch({ type: Types.SET_KEY, payload: key });
  }, []);

  const contextValue = useMemo(
    () => ({
      registerBook,
      setAtStart,
      setAtEnd,
      setTotalLocations,
      setCurrentLocation,
      setProgress,
      setLocations,
      setIsLoading,
      setIsRendering,

      goToLocation,
      goToLocationWithNumber,
      goPrevious,
      goNext,
      getLocations,
      getCurrentLocation,
      search,
      calculateHtml,

      addMark,
      removeMark,

      setKey,
      key: state.key,

      changeTheme,
      changeFontFamily,
      changeFontSize,
      theme: state.theme,

      atStart: state.atStart,
      atEnd: state.atEnd,
      totalLocations: state.totalLocations,
      currentLocation: state.currentLocation,
      progress: state.progress,
      locations: state.locations,
      isLoading: state.isLoading,
      isRendering: state.isRendering,

      searchResults: state.searchResults,
      setSearchResults,

      currentHtml: state.currentHtml,
      setCurrentHtml,
    }),
    [
      addMark,
      changeFontFamily,
      changeFontSize,
      changeTheme,
      getCurrentLocation,
      getLocations,
      goNext,
      goPrevious,
      goToLocation,
      goToLocationWithNumber,
      registerBook,
      removeMark,
      search,
      calculateHtml,
      setAtEnd,
      setAtStart,
      setCurrentLocation,
      setIsLoading,
      setIsRendering,
      setKey,
      setLocations,
      setProgress,
      setSearchResults,
      setCurrentHtml,
      setTotalLocations,
      state.atEnd,
      state.atStart,
      state.currentLocation,
      state.isLoading,
      state.isRendering,
      state.key,
      state.locations,
      state.progress,
      state.searchResults,
      state.currentHtml,
      state.theme,
      state.totalLocations,
    ]
  );
  return (
    <ReaderContext.Provider value={contextValue}>
      {children}
    </ReaderContext.Provider>
  );
}

export { ReaderProvider, ReaderContext };
